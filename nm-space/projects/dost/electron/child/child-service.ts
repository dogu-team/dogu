import { Status } from '@dogu-private/dost-children';
import { Instance, parseAxiosError } from '@dogu-tech/common';
import { ChildProcess as DoguChildProcess } from '@dogu-tech/node';
import { Code } from '@dogu-tech/types';
import * as Sentry from '@sentry/electron/main';
import axios from 'axios';
import { ChildProcess, execSync, fork } from 'child_process';
import { ipcMain } from 'electron';
import pidtree from 'pidtree';
import { childClientKey, ChildProcessInfo, ChildTree, HostAgentConnectionStatus, IChildClient, Key } from '../../src/shares/child';
import { AppConfigService } from '../app-config/app-config-service';
import { FeatureConfigService } from '../feature-config/feature-config-service';
import { logger } from '../log/logger.instance';
import { FilledChildOptions } from './types';

let stripAnsi: any | null = null;
import('strip-ansi').then((module) => {
  stripAnsi = module.default;
});

export class ChildService implements IChildClient {
  static instance: ChildService;

  static open(appConfigService: AppConfigService, featureConfigService: FeatureConfigService) {
    ChildService.instance = new ChildService(appConfigService, featureConfigService);
    const { instance } = ChildService;
    ipcMain.handle(childClientKey.close, (_, key: Key) => instance.close(key));
    ipcMain.handle(childClientKey.isActive, (_, key: Key) => instance.isActive(key));
    ipcMain.handle(childClientKey.getHostAgentConnectionStatus, () => instance.getHostAgentConnectionStatus());
    ipcMain.handle(childClientKey.getChildTree, () => instance.getChildTree());
  }

  static close(): Promise<void> {
    return ChildService.instance.closeAll();
  }

  private children = new Map<Key, ChildProcess>();

  private constructor(private readonly appConfigService: AppConfigService, private readonly featureConfigService: FeatureConfigService) {}

  open(key: Key, module: string, options: FilledChildOptions): ChildProcess {
    if (this.children.has(key)) {
      throw new Error(`child process already exists: ${key}`);
    }
    const { forkOptions, childLogger } = options;
    const child = fork(module, forkOptions);
    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');
    child.on('spawn', () => {
      logger.info('child process spawned', { key });
    });
    child.stdout?.on('data', (data) => {
      const dataString = data.toString();
      const stripped = stripAnsi ? stripAnsi(dataString) : dataString;
      logger.info(`[${key}] ${stripped}`);
      if (this.featureConfigService.get('useSentry')) {
        Sentry.addBreadcrumb({
          type: 'default',
          category: key,
          message: stripped,
          level: 'info',
        });
      }
    });
    child.stderr?.on('data', (data) => {
      const dataString = data.toString();
      const stripped = stripAnsi ? stripAnsi(dataString) : dataString;
      logger.warn(`[${key}] ${stripped}`);
      if (this.featureConfigService.get('useSentry')) {
        Sentry.addBreadcrumb({
          type: 'default',
          category: key,
          message: stripped,
          level: 'error',
        });
      }
    });
    child.on('error', (error) => {
      logger.error('child process error', { key, error });
    });
    child.on('close', (code, signal) => {
      logger.info('child process exited', { key, code, signal });
      const added = this.children.get(key);
      if (!added) {
        return;
      }
      this.children.delete(key);
      if (code !== 0) {
        if (this.featureConfigService.get('useSentry')) {
          Sentry.addBreadcrumb({
            type: 'default',
            category: key,
            message: `child process(${key}) exited with code ${code} and signal ${signal}`,
            level: 'fatal',
          });
        }
      }
    });
    child.on('message', (message, sendHandle) => {
      logger.info('child process message', { key, message, sendHandle });
    });
    this.children.set(key, child);
    return child;
  }

  close(key: Key): Promise<void> {
    logger.info('child process close called', { err: new Error().stack });
    return new Promise((resolve) => {
      const child = this.children.get(key);
      if (!child) {
        resolve();
        return;
      }
      child.on('close', (code, signal) => {
        logger.info('child process exited', { key, code, signal });
        resolve();
      });
      if (child.pid) {
        pidtree(child.pid, (err, pids) => {
          if (err) {
            logger.error('child process close. pidtree error', { key, error: err });
          } else {
            logger.info('child process close. pidtree', { key, pids });
            for (const pid of pids) {
              killPid(key, pid);
            }
          }
          killPid(key, child.pid!);
        });
      } else {
        logger.warn('child process pid is null', { key });
        child.kill();
      }
    });
  }

  async closeAll(): Promise<void> {
    await Promise.all(Array.from(this.children.keys()).map((key) => this.close(key)));
  }

  isActive(key: Key): Promise<boolean> {
    return Promise.resolve(this.children.has(key));
  }

  async getHostAgentConnectionStatus(): Promise<HostAgentConnectionStatus> {
    const isHostAgentActive = await this.isActive('host-agent');
    if (!isHostAgentActive) {
      return {
        status: 'is-not-active',
        code: Code.CODE_HOST_AGENT_NOT_RUNNING,
        updatedAt: new Date(),
      };
    }
    const doguHostAgentPort = await this.appConfigService.get<number>('DOGU_HOST_AGENT_PORT');
    const pathProvider = new Status.getConnectionStatus.pathProvider();
    const path = Status.getConnectionStatus.resolvePath(pathProvider);
    const response = await axios
      .get<Instance<typeof Status.getConnectionStatus.responseBody>>(`http://localhost:${doguHostAgentPort}${path}`)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        const parsed = parseAxiosError(error);
        logger.warn('getHostAgentConnectionStatus failed', { error: parsed });
        const response: HostAgentConnectionStatus = {
          status: 'disconnected',
          code: Code.CODE_HOST_AGENT_REQUEST_FAILED,
          updatedAt: new Date(),
        };
        return response;
      });
    return response;
  }

  getChildTree(): Promise<ChildTree> {
    return new Promise((resolve) => {
      pidtree(process.pid, async (err, pids) => {
        const psResult = await DoguChildProcess.execIgnoreError('ps -e', { timeout: 3000 }, logger);
        const lines = psResult.stdout.split('\n');
        const pidToCommandMap = lines
          .map((line) => {
            const [pid, _, time, ...command] = line.trim().split(/\s{1,}|\t/);
            return { pid, time: time, command: command.join(' ') };
          })
          .reduce((acc, cur) => {
            acc[cur.pid] = { pid: parseInt(cur.pid), time: cur.time, name: cur.command };
            return acc;
          }, {} as { [key: string]: ChildProcessInfo });

        if (err) {
          logger.error('child process close. pidtree error', { error: err });
          resolve({ childs: [] });
        } else {
          logger.info('child process close. pidtree', { pids });
          resolve({
            childs: pids
              .map((pid) => ({ pid, time: pid in pidToCommandMap ? pidToCommandMap[pid].time : '??', name: pid in pidToCommandMap ? pidToCommandMap[pid].name : 'unknown' }))
              .sort((a, b) => a.pid - b.pid),
          });
        }
      });
    });
  }
}

function killPid(key: string, pid: number) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /F /T`);
    } else {
      execSync(`kill -9 ${pid}`);
    }
    logger.info(`child process close. killed `, { key, pid });
  } catch (e) {
    logger.warn('child process close. kill error', { key, error: e });
  }
}
