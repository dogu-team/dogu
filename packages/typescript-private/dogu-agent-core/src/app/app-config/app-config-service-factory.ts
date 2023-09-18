import { Logger } from '@dogu-tech/node';
import { AppConfigService, AppConfigServiceOptions } from './app-config-service';
import { DotenvService, DotEnvServiceOptions } from './dotenv-service';
import Store from 'electron-store';
import fs from 'fs';
import path from 'path';
import { AppConfigSchema } from '../../shares/app-config';
import _ from 'lodash';

const AppConfigFileExtension = 'json';

function resolveAppName(appName: string): string {
  return appName.toLowerCase().replaceAll(' ', '-');
}

async function clearConfigsIfInvalid(dotenvService: DotenvService, configsPath: string, appName: string, logger: Logger): Promise<void> {
  const doguRunTypeKey = 'DOGU_RUN_TYPE';
  const appNameResolved = resolveAppName(appName);
  const appConfigFilePath = path.resolve(configsPath, `${appNameResolved}.${AppConfigFileExtension}`);
  const stat = await fs.promises.stat(appConfigFilePath).catch(() => null);
  if (stat && stat.isFile()) {
    const appConfigContent = await fs.promises.readFile(appConfigFilePath, { encoding: 'utf8' });
    const appConfigParsed = JSON.parse(appConfigContent);
    const appConfigDoguRunType = _.get(appConfigParsed, doguRunTypeKey) as string | undefined;
    const dotenvDoguRunType = await dotenvService.find(doguRunTypeKey, logger);
    if (appConfigDoguRunType && dotenvDoguRunType && appConfigDoguRunType !== dotenvDoguRunType) {
      await fs.promises.rm(configsPath, { recursive: true, force: true });
    }
  }
  await fs.promises.mkdir(configsPath, { recursive: true });
}

export interface AppConfigServiceFactoryOptions extends DotEnvServiceOptions, AppConfigServiceOptions {
  configsPath: string;
  appName: string;
  logger: Logger;
}

export class AppConfigServiceFactory {
  async create(options: AppConfigServiceFactoryOptions): Promise<AppConfigService> {
    const { appName, configsPath, logger } = options;
    Store.initRenderer();

    const dotenvService = new DotenvService(options);
    await clearConfigsIfInvalid(dotenvService, configsPath, appName, logger);

    const appNameResolved = resolveAppName(appName);
    const client = new Store<AppConfigSchema>({
      name: appNameResolved,
      schema: AppConfigSchema,
      accessPropertiesByDotNotation: false,
      cwd: configsPath,
      fileExtension: AppConfigFileExtension,
      clearInvalidConfig: true,
      migrations: {
        '0.0.0': (store) => {
          store.clear();
        },
      },
    });
    logger.debug('config path', { path: client.path });

    const appConfigService = new AppConfigService(options);
    await dotenvService.merge(appConfigService, logger);
    return appConfigService;
  }
}
