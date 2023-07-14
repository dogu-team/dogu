import { loop } from '@dogu-tech/common';
import { ChildProcess as DoguChildProcess } from '@dogu-tech/node';
import { Code } from '@dogu-tech/types';
import { ipcMain } from 'electron';
import pidtree from 'pidtree';
import { childClientKey, ChildProcessInfo, ChildTree, HostAgentConnectionStatus, IChildClient, Key } from '../../src/shares/child';
import { AppConfigService } from '../app-config/app-config-service';
import { FeatureConfigService } from '../feature-config/feature-config-service';
import { logger } from '../log/logger.instance';
import { DeviceServerChild } from './instances/device-server';
import { HostAgentChild } from './instances/host-agent';
import { closeAllChildren } from './instances/lifecycle';
import { Child } from './types';

export class ChildService implements IChildClient {
  static instance: ChildService;

  static open(appConfigService: AppConfigService, featureConfigService: FeatureConfigService) {
    ChildService.instance = new ChildService(appConfigService, featureConfigService, {
      'device-server': new DeviceServerChild(appConfigService, featureConfigService),
      'host-agent': new HostAgentChild(appConfigService, featureConfigService),
    });
    const { instance } = ChildService;
    ipcMain.handle(childClientKey.isActive, (_, key: Key) => instance.isActive(key));
    ipcMain.handle(childClientKey.connect, (_, token: string) => instance.connect(token));
    ipcMain.handle(childClientKey.getHostAgentConnectionStatus, () => instance.getHostAgentConnectionStatus());
    ipcMain.handle(childClientKey.getChildTree, () => instance.getChildTree());
  }

  static close(): Promise<void> {
    return ChildService.instance.closeAll();
  }

  private get deviceServer(): DeviceServerChild {
    return this.children['device-server'] as DeviceServerChild;
  }

  private get hostAgent(): HostAgentChild {
    return this.children['host-agent'] as HostAgentChild;
  }

  private constructor(
    private readonly appConfigService: AppConfigService,
    public readonly featureConfigService: FeatureConfigService,
    private readonly children: { [key in Key]: Child },
    private isConnecting = false,
  ) {}

  async isActive(key: Key): Promise<boolean> {
    return await this.children[key].isActive();
  }

  async closeAll(): Promise<void> {
    await Promise.all([this.deviceServer.close, this.hostAgent.close, closeAllChildren]);
  }

  async connect(token: string): Promise<HostAgentConnectionStatus> {
    this.isConnecting = true;
    const ret = await this.connectInternal(token).catch((e) => {
      logger.error('connectInternal error', { error: e });
      this.isConnecting = false;
      throw e;
    });
    this.isConnecting = false;
    return ret;
  }

  private async connectInternal(token: string): Promise<HostAgentConnectionStatus> {
    if (!(await this.deviceServer.isActive())) {
      await this.deviceServer.open();
      for await (const _ of loop(1000, 60)) {
        if (await this.deviceServer.isActive()) {
          break;
        }
      }
      const isActive = await this.deviceServer.isActive();
      if (!isActive) {
        return {
          status: 'disconnected',
          code: Code.CODE_DEVICE_SERVER_UNEXPECTED_ERROR,
          reason: 'device-server boot failed.',
          updatedAt: new Date(),
        };
      }
    }
    if (await this.hostAgent.isActive()) {
      await this.hostAgent.close();
    }
    await this.appConfigService.set('DOGU_HOST_TOKEN', token);
    await this.hostAgent.open();
    for await (const _ of loop(1000, 60)) {
      if (await this.hostAgent.isActive()) {
        break;
      }
    }

    for await (const _ of loop(1000, 999)) {
      const status = await this.hostAgent.getConnectionStatus();
      if (status.status !== 'connecting') {
        return status;
      }
    }
    return {
      status: 'disconnected',
      code: Code.CODE_HOST_AGENT_REQUEST_FAILED,
      reason: 'Tried to connect, but it took too long.',
      updatedAt: new Date(),
    };
  }

  async getHostAgentConnectionStatus(): Promise<HostAgentConnectionStatus> {
    if (this.isConnecting) {
      return {
        status: 'connecting',
        code: Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED,
        updatedAt: new Date(),
      };
    }
    return await this.hostAgent.getConnectionStatus();
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
