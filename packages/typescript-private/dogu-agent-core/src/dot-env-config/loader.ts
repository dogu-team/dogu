import { HostPaths, Logger } from '@dogu-tech/node';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { AppConfigService } from '../app-config/service';
import { DotEnvConfigService } from './service';

export interface DotEnvConfigLoaderOptions {
  appConfigService: AppConfigService;
  configsPath: string;
  logger: Logger;
}

export class DotEnvConfigLoader {
  constructor(private readonly options: DotEnvConfigLoaderOptions) {}

  async load(): Promise<DotEnvConfigService> {
    const { appConfigService, configsPath, logger } = this.options;

    const runType = appConfigService.get<string>('DOGU_RUN_TYPE');
    const dotEnvConfigPath = HostPaths.dotEnvConfigPath(configsPath, runType);
    const service = new DotEnvConfigService({
      dotEnvConfigPath,
    });

    logger.verbose('external env load');
    const stat = await fs.promises.stat(dotEnvConfigPath).catch(() => null);
    if (!stat) {
      logger.verbose('external env not exist. write default external env');
      await this.writeDefaultExternalEnv(dotEnvConfigPath, service);
    }

    const result = dotenv.config({ path: dotEnvConfigPath, override: true });
    if (result.error) {
      logger.error('external env load error', { error: result.error });
    }

    return service;
  }

  private async writeDefaultExternalEnv(dotEnvConfigPath: string, service: DotEnvConfigService): Promise<void> {
    await fs.promises.mkdir(path.dirname(dotEnvConfigPath), { recursive: true });
    await fs.promises.writeFile(dotEnvConfigPath, '');
    await service.write('JAVA_HOME', HostPaths.external.defaultJavaHomePath());
    await service.write('ANDROID_HOME', HostPaths.external.defaultAndroidHomePath());
    await service.write('APPIUM_HOME', HostPaths.external.defaultAppiumHomePath());
  }
}
