import { ChildListener, ChildService as Impl, ChildServiceFactory, DeviceServerChild, HostAgentChild } from '@dogu-private/dogu-agent-core/app';
import * as Sentry from '@sentry/electron/main';
import { ipcMain } from 'electron';
import { childClientKey, ChildTree, HostAgentConnectionStatus, Key } from '../../src/shares/child';
import { AppConfigService } from '../app-config/app-config-service';
import { ExternalService } from '../external/external-service';
import { FeatureConfigService } from '../feature-config/feature-config-service';
import { logger } from '../log/logger.instance';
import { LogsPath } from '../path-map';

export class ChildService {
  static instance: ChildService;

  static open(appConfigService: AppConfigService, featureConfigService: FeatureConfigService, externalService: ExternalService) {
    const listener: ChildListener = {
      onStdout: (key, data) => {
        if (featureConfigService.get('useSentry')) {
          Sentry.addBreadcrumb({
            type: 'default',
            category: key as string,
            message: data,
            level: 'info',
          });
        }
      },
      onStderr: (key, data) => {
        if (featureConfigService.get('useSentry')) {
          Sentry.addBreadcrumb({
            type: 'default',
            category: key as string,
            message: data,
            level: 'error',
          });
        }
      },
      onClose: (key, code, signal) => {
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
      },
    };

    const impl = new ChildServiceFactory({
      appConfigService: appConfigService.impl,
      externalService: externalService.impl,
      logsPath: LogsPath,
      logger: logger,
      listener,
    }).create();

    ChildService.instance = new ChildService(impl);
    const { instance } = ChildService;
    ipcMain.handle(childClientKey.isActive, (_, key: Key) => instance.isActive(key));
    ipcMain.handle(childClientKey.connect, (_, token: string) => instance.connect(token));
    ipcMain.handle(childClientKey.getHostAgentConnectionStatus, () => instance.getHostAgentConnectionStatus());
    ipcMain.handle(childClientKey.getChildTree, () => instance.getChildTree());
  }

  static async close(): Promise<void> {
    return await ChildService.instance.closeAll();
  }

  get deviceServer(): DeviceServerChild {
    return this.impl.deviceServer;
  }

  get hostAgent(): HostAgentChild {
    return this.impl.hostAgent;
  }

  private constructor(readonly impl: Impl) {}

  async isActive(key: Key): Promise<boolean> {
    return await this.impl.isActive(key);
  }

  async closeAll(): Promise<void> {
    return await this.impl.closeAll();
  }

  async connect(token: string): Promise<HostAgentConnectionStatus> {
    return await this.impl.connect(token);
  }

  async getHostAgentConnectionStatus(): Promise<HostAgentConnectionStatus> {
    return await this.impl.getHostAgentConnectionStatus();
  }

  async getChildTree(): Promise<ChildTree> {
    return await this.impl.getChildTree();
  }
}
