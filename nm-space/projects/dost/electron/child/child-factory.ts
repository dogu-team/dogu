import { ipcMain } from 'electron';
import { childCallbackKey, childFactoryKey, IChildFactory, Key } from '../../src/shares/child';
import { AppConfigService } from '../app-config/app-config-service';
import { logger } from '../log/logger.instance';
import { WindowService } from '../window/window-service';
import { ChildService } from './child-service';
import { DeviceServerChild } from './instances/device-server';
import { HostAgentChild } from './instances/host-agent';
import { Child } from './types';

export class ChildFactory implements IChildFactory {
  static instance: ChildFactory;

  static async open(childService: ChildService, appConfigService: AppConfigService, windowService: WindowService): Promise<void> {
    ChildFactory.instance = new ChildFactory(childService, appConfigService, windowService);
    const { instance } = ChildFactory;
    ipcMain.on(childFactoryKey.open, (event, key: Key) => instance.open(key).catch((error) => logger.error('ChildFactory.open', { key, error })));
    await Promise.all(
      Array.from(instance.children.entries()).map(async ([key, child]) => {
        child.setOnChangeHandler();
        const openable = await child.openable();
        if (openable) {
          await instance.open(key);
        }
      }),
    );
  }

  private readonly children = new Map<Key, Child>();

  private constructor(readonly childService: ChildService, readonly appConfigService: AppConfigService, readonly windowService: WindowService) {
    this.children.set('device-server', new DeviceServerChild(this, appConfigService, childService));
    this.children.set('host-agent', new HostAgentChild(this, appConfigService, childService));
  }

  async open(key: Key): Promise<void> {
    const { windowService } = this;
    const child = this.children.get(key);
    if (!child) {
      throw new Error(`invalid child key: ${key}`);
    }
    const childProcess = await child.open();
    childProcess.on('spawn', () => {
      logger.debug('ChildFactory.open', { key, event: 'spawn' });
      windowService.window?.webContents.send(childCallbackKey.onSpawn, key);
    });
    childProcess.on('error', (error) => {
      logger.error('ChildFactory.open', { key, event: 'error', error });
      windowService.window?.webContents.send(childCallbackKey.onError, key, error);
    });
    childProcess.on('close', (exitCode, signal) => {
      logger.debug('ChildFactory.open', { key, event: 'close', exitCode, signal });
      windowService.window?.webContents.send(childCallbackKey.onClose, key, exitCode, signal);
    });
  }
}
