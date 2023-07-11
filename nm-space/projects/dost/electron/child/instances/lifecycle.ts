import { logger } from '@dogu-private/host-agent';
import * as Sentry from '@sentry/electron/main';
import { ChildProcess, execSync, fork } from 'child_process';
import pidtree from 'pidtree';
import { Key } from 'react';
import { FeatureConfigService } from '../../feature-config/feature-config-service';
import { stripAnsi } from '../../log/stript-ansi';
import { FilledChildOptions } from '../types';

export function openChild(key: Key, module: string, options: FilledChildOptions, featureConfigService: FeatureConfigService): ChildProcess {
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
    if (featureConfigService.get('useSentry')) {
      Sentry.addBreadcrumb({
        type: 'default',
        category: key as string,
        message: stripped,
        level: 'info',
      });
    }
  });
  child.stderr?.on('data', (data) => {
    const dataString = data.toString();
    const stripped = stripAnsi ? stripAnsi(dataString) : dataString;
    logger.warn(`[${key}] ${stripped}`);
    if (featureConfigService.get('useSentry')) {
      Sentry.addBreadcrumb({
        type: 'default',
        category: key as string,
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
    if (code !== 0) {
      if (featureConfigService.get('useSentry')) {
        Sentry.addBreadcrumb({
          type: 'default',
          category: key as string,
          message: `child process(${key}) exited with code ${code} and signal ${signal}`,
          level: 'fatal',
        });
      }
    }
  });
  child.on('message', (message, sendHandle) => {
    logger.info('child process message', { key, message, sendHandle });
  });
  return child;
}

export function closeChild(key: Key, child: ChildProcess): Promise<void> {
  logger.info('child process close called', { err: new Error().stack });
  return new Promise((resolve) => {
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
            killPid(key as string, pid);
          }
        }
        killPid(key as string, child.pid!);
      });
    } else {
      logger.warn('child process pid is null', { key });
      child.kill();
    }
  });
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
