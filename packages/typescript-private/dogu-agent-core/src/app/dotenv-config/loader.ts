import { HostPaths, Logger } from '@dogu-tech/node';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { AppConfigService } from '../app-config/service';
import { DotenvConfigService } from './service';

export interface DotenvConfigLoaderOptions {
  appConfigService: AppConfigService;
  configsPath: string;
  logger: Logger;
}

export class DotenvConfigLoader {
  constructor(private readonly options: DotenvConfigLoaderOptions) {}

  async load(): Promise<DotenvConfigService> {
    const { appConfigService, configsPath, logger } = this.options;

    const runType = appConfigService.get<string>('DOGU_RUN_TYPE');
    const dotenvConfigPath = HostPaths.dotenvConfigPath(configsPath, runType);
    const service = new DotenvConfigService({
      dotenvConfigPath,
    });

    logger.verbose('external env load');
    const stat = await fs.promises.stat(dotenvConfigPath).catch(() => null);
    if (!stat) {
      logger.verbose('external env not exist. write default external env');
      await this.writeDefaultExternalEnv(dotenvConfigPath, service);
    }

    const result = dotenv.config({ path: dotenvConfigPath, override: true });
    if (result.error) {
      logger.error('external env load error', { error: result.error });
    }

    return service;
  }

  private async writeDefaultExternalEnv(dotenvConfigPath: string, service: DotenvConfigService): Promise<void> {
    await fs.promises.mkdir(path.dirname(dotenvConfigPath), { recursive: true });
    await fs.promises.writeFile(dotenvConfigPath, '');
    await service.write('JAVA_HOME', HostPaths.external.defaultJavaHomePath());
    await service.write('ANDROID_HOME', HostPaths.external.defaultAndroidHomePath());
    await service.write('APPIUM_HOME', HostPaths.external.defaultAppiumHomePath());
    await service.write('APPLE_RESIGN_IDENTITY_NAME', 'Apple Development: Apple Dogu (S8F42MYPGH)');
  }
}
