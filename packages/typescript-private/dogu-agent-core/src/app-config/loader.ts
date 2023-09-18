import { Logger } from '@dogu-tech/node';
import Store from 'electron-store';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { DotenvMerger, DotEnvMergerOptions } from './dotenv-merger';
import { AppConfigService, AppConfigServiceOptions } from './service';
import { AppConfigSchema } from './types';

const AppConfigFileExtension = 'json';

function resolveAppName(appName: string): string {
  return appName.toLowerCase().replaceAll(' ', '-');
}

async function clearConfigsIfInvalid(dotenvMerger: DotenvMerger, configsPath: string, appName: string, logger: Logger): Promise<void> {
  const doguRunTypeKey = 'DOGU_RUN_TYPE';
  const appNameResolved = resolveAppName(appName);
  const appConfigFilePath = path.resolve(configsPath, `${appNameResolved}.${AppConfigFileExtension}`);
  const stat = await fs.promises.stat(appConfigFilePath).catch(() => null);
  if (stat && stat.isFile()) {
    const appConfigContent = await fs.promises.readFile(appConfigFilePath, { encoding: 'utf8' });
    const appConfigParsed = JSON.parse(appConfigContent) as { DOGU_RUN_TYPE?: string };
    const appConfigDoguRunType = _.get(appConfigParsed, doguRunTypeKey);
    const dotenvDoguRunType = await dotenvMerger.find(doguRunTypeKey, logger);
    if (appConfigDoguRunType && dotenvDoguRunType && appConfigDoguRunType !== dotenvDoguRunType) {
      await fs.promises.rm(configsPath, { recursive: true, force: true });
    }
  }
  await fs.promises.mkdir(configsPath, { recursive: true });
}

export interface AppConfigLoaderOptions extends DotEnvMergerOptions, Omit<AppConfigServiceOptions, 'client'> {
  configsPath: string;
  appName: string;
  logger: Logger;
}

export class AppConfigLoader {
  constructor(private readonly options: AppConfigLoaderOptions) {}

  async load(): Promise<AppConfigService> {
    const { options } = this;
    const { appName, configsPath, logger } = this.options;
    Store.initRenderer();

    const dotenvMerger = new DotenvMerger(options);
    await clearConfigsIfInvalid(dotenvMerger, configsPath, appName, logger);

    const appNameResolved = resolveAppName(appName);
    const client = new Store<AppConfigSchema>({
      name: appNameResolved,
      schema: AppConfigSchema,
      accessPropertiesByDotNotation: false,
      cwd: configsPath,
      fileExtension: AppConfigFileExtension,
      clearInvalidConfig: true,
      migrations: {
        '0.0.0': (store): void => {
          store.clear();
        },
      },
    });
    logger.debug('config path', { path: client.path });

    const service = new AppConfigService({
      ...options,
      client,
    });
    await dotenvMerger.merge(service, logger);
    return service;
  }
}
