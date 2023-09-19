import { DefaultProcessInfo, errorify, loop, Printable } from '@dogu-tech/common';
import { getProcessesMap } from '@dogu-tech/node';
import { Code } from '@dogu-tech/types';
import pidtree from 'pidtree';
import { ChildKey } from '../../shares/child';
import { AppConfigService } from '../app-config/service';
import { DeviceServerChild } from './device-server/child';
import { HostAgentChild } from './host-agent/child';
import { closeAllChildren } from './lifecycle';
import { ChildMap, ChildTree, HostAgentConnectionStatus } from './types';

export interface ChildServiceOptions {
  childMap: ChildMap;
  appConfigService: AppConfigService;
  logger: Printable;
}

export class ChildService {
  private isConnecting = false;
  private readonly childMap: ChildMap;
  private readonly appConfigService: AppConfigService;
  private readonly logger: Printable;

  get deviceServer(): DeviceServerChild {
    return this.childMap['device-server'] as DeviceServerChild;
  }

  get hostAgent(): HostAgentChild {
    return this.childMap['host-agent'] as HostAgentChild;
  }

  constructor(options: ChildServiceOptions) {
    this.childMap = options.childMap;
    this.appConfigService = options.appConfigService;
    this.logger = options.logger;
  }

  async isActive(key: ChildKey): Promise<boolean> {
    return await this.childMap[key].isActive();
  }

  async closeAll(): Promise<void> {
    await Promise.all([this.deviceServer.close(), this.hostAgent.close(), closeAllChildren(this.logger)]);
  }

  async connect(token: string): Promise<HostAgentConnectionStatus> {
    this.isConnecting = true;
    const ret = await this.connectInternal(token).catch((e) => {
      this.logger.error('connectInternal error', { error: errorify(e) });
      this.isConnecting = false;
      throw e;
    });
    this.isConnecting = false;
    return ret;
  }

  private async connectInternal(token: string): Promise<HostAgentConnectionStatus> {
    if (!(await this.deviceServer.isActive())) {
      if (!(await this.deviceServer.openable())) {
        return {
          status: 'disconnected',
          code: Code.CODE_DEVICE_SERVER_UNEXPECTED_ERROR,
          reason: 'device-server not openable.',
          updatedAt: new Date(),
        };
      }
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
    this.appConfigService.set('DOGU_HOST_TOKEN', token);
    if (!this.hostAgent.openable()) {
      return {
        status: 'disconnected',
        code: Code.CODE_HOST_AGENT_UNEXPECTED_ERROR,
        reason: 'host-agent not openable.',
        updatedAt: new Date(),
      };
    }
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

  async getChildTree(): Promise<ChildTree> {
    return new Promise((resolve) => {
      pidtree(process.pid, { advanced: true }, (err, procs) => {
        (async (): Promise<void> => {
          const procInfoMap = await getProcessesMap(this.logger);
          const myInfo = procInfoMap.get(process.pid) ?? { ...DefaultProcessInfo(), pid: process.pid };
          const root: ChildTree = { info: myInfo, children: [] };
          if (err) {
            this.logger.error('child process pidtree error', { error: err });
            resolve(root);
          } else {
            const childTrees: ChildTree[] = procs
              .map((proc) => {
                const elem = procInfoMap.get(proc.pid);

                if (elem) {
                  const spaceSplited = elem.commandLine.replaceAll('\\', '/').split(' ');
                  const commandName = spaceSplited[0].split('/').slice(-1).join('/');
                  const shortCommandLine = `${commandName} ${spaceSplited.slice(1).join(' ')}`;
                  return {
                    info: {
                      ...elem,
                      commandLine: shortCommandLine,
                    },
                    children: [],
                  };
                }
                return {
                  info: {
                    ...DefaultProcessInfo(),
                    pid: proc.pid,
                  },
                  children: [],
                };
              })
              .sort((a, b) => a.info.pid - b.info.pid);
            for (const child of childTrees) {
              const parent = childTrees.find((c) => c.info.pid === child.info.ppid);
              if (parent) {
                parent.children.push(child);
              } else {
                root.children.push(child);
              }
            }
            resolve(root);
          }
        })().catch((error) => {
          this.logger.error('getChildTree error', { error: errorify(error) });
        });
      });
    });
  }
}
