import { AppConfigLoader, AppConfigService as Impl } from '@dogu-private/dogu-agent-core/app';
import { AppConfigKey } from '@dogu-private/dogu-agent-core/shares';
import { app, ipcMain } from 'electron';
import isDev from 'electron-is-dev';
import path from 'path';
import { appConfigClientKey } from '../../src/shares/app-config';
import { logger } from '../log/logger.instance';
import { ConfigsPath } from '../path-map';

export class AppConfigService {
  static instance: AppConfigService;

  static open(): void {
    const dotenvSearchPaths: string[] = [];
    if (isDev) {
      dotenvSearchPaths.push(process.cwd());
    }
    dotenvSearchPaths.push(path.resolve(process.resourcesPath, 'dotenv'));

    const impl = new AppConfigLoader({
      appName: app.name,
      configsPath: ConfigsPath,
      dotenvSearchPaths,
      logger,
    }).loadSync();

    AppConfigService.instance = new AppConfigService(impl);
    const { instance } = AppConfigService;
    ipcMain.handle(appConfigClientKey.getOrDefault, (_, key: AppConfigKey, defaultValue: unknown) => instance.getOrDefault(key, defaultValue));
    ipcMain.handle(appConfigClientKey.get, (_, key: AppConfigKey) => instance.get(key));
    ipcMain.handle(appConfigClientKey.set, (_, key: AppConfigKey, value: any) => instance.set(key, value));
    ipcMain.handle(appConfigClientKey.delete, (_, key: AppConfigKey) => instance.delete(key));
  }

  private constructor(readonly impl: Impl) {}

  async getOrDefault<T = any>(key: AppConfigKey, defaultValue: T): Promise<T> {
    return this.impl.getOrDefault(key, defaultValue);
  }

  async get<T = any>(key: AppConfigKey): Promise<T> {
    return this.impl.get(key);
  }

  async set<T = any>(key: AppConfigKey, value: T): Promise<void> {
    this.impl.set(key, value);
  }

  async delete(key: AppConfigKey): Promise<void> {
    this.impl.delete(key);
  }
}
