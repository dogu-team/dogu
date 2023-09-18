import { DotEnvConfigKey, DotEnvConfigLoader, DotEnvConfigService as Impl } from '@dogu-private/dogu-agent-core';
import { ipcMain } from 'electron';
import { dotEnvConfigClientKey } from '../../src/shares/dot-env-config';
import { AppConfigService } from '../app-config/app-config-service';
import { logger } from '../log/logger.instance';
import { ConfigsPath } from '../path-map';

export class DotEnvConfigService {
  static instance: DotEnvConfigService;

  private constructor(readonly impl: Impl) {}

  static async open(appConfigService: AppConfigService): Promise<void> {
    const impl = await new DotEnvConfigLoader({
      appConfigService: appConfigService.impl,
      configsPath: ConfigsPath,
      logger,
    }).load();

    DotEnvConfigService.instance = new DotEnvConfigService(impl);
    const { instance } = DotEnvConfigService;
    ipcMain.handle(dotEnvConfigClientKey.set, async (_, key: DotEnvConfigKey, value: string) => instance.write(key, value));
    ipcMain.handle(dotEnvConfigClientKey.get, (_, key: DotEnvConfigKey) => instance.get(key));
    ipcMain.handle(dotEnvConfigClientKey.getDotEnvConfigPath, () => instance.getDotEnvConfigPath());
  }

  getDotEnvConfigPath(): string {
    return this.impl.getDotEnvConfigPath();
  }

  get(key: DotEnvConfigKey): string | undefined {
    return this.impl.get(key);
  }

  async write(key: DotEnvConfigKey, value: string): Promise<void> {
    await this.impl.write(key, value);
  }
}
