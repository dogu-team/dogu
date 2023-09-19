import { DotenvConfigKey, DotenvConfigLoader, DotenvConfigService as Impl } from '@dogu-private/dogu-agent-core/app';
import { ipcMain } from 'electron';
import { dotenvConfigClientKey } from '../../src/shares/dotenv-config';
import { AppConfigService } from '../app-config/app-config-service';
import { logger } from '../log/logger.instance';
import { ConfigsPath } from '../path-map';

export class DotEnvConfigService {
  static instance: DotEnvConfigService;

  private constructor(readonly impl: Impl) {}

  static async open(appConfigService: AppConfigService): Promise<void> {
    const impl = await new DotenvConfigLoader({
      appConfigService: appConfigService.impl,
      configsPath: ConfigsPath,
      logger,
    }).load();

    DotEnvConfigService.instance = new DotEnvConfigService(impl);
    const { instance } = DotEnvConfigService;
    ipcMain.handle(dotenvConfigClientKey.set, async (_, key: DotenvConfigKey, value: string) => instance.write(key, value));
    ipcMain.handle(dotenvConfigClientKey.get, (_, key: DotenvConfigKey) => instance.get(key));
    ipcMain.handle(dotenvConfigClientKey.getDotenvConfigPath, () => instance.getDotenvConfigPath());
  }

  getDotenvConfigPath(): string {
    return this.impl.getDotenvConfigPath();
  }

  get(key: DotenvConfigKey): string | undefined {
    return this.impl.get(key);
  }

  async write(key: DotenvConfigKey, value: string): Promise<void> {
    await this.impl.write(key, value);
  }
}
