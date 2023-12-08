import { Logger } from '@dogu-tech/node';
import Conf from 'conf';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { AppConfigSchema } from '../../shares/app-config';
import { DotenvMerger, DotEnvMergerOptions } from './dotenv-merger';
import { AppConfigService, AppConfigServiceOptions } from './service';

const AppConfigFileExtension = 'json';

function resolveAppName(appName: string): string {
  return appName.toLowerCase().replaceAll(' ', '-');
}

function clearConfigsIfInvalid(dotenvMerger: DotenvMerger, configsPath: string, appName: string, logger: Logger): void {
  const doguRunTypeKey = 'DOGU_RUN_TYPE';
  const appNameResolved = resolveAppName(appName);
  const appConfigFilePath = path.resolve(configsPath, `${appNameResolved}.${AppConfigFileExtension}`);
  let stat = null;
  try {
    stat = fs.statSync(appConfigFilePath);
  } catch (e) {}
  if (stat && stat.isFile()) {
    const appConfigContent = fs.readFileSync(appConfigFilePath, { encoding: 'utf8' });
    const appConfigParsed = JSON.parse(appConfigContent) as { DOGU_RUN_TYPE?: string };
    const appConfigDoguRunType = _.get(appConfigParsed, doguRunTypeKey);
    const dotenvDoguRunType = dotenvMerger.find(doguRunTypeKey, logger);
    if (appConfigDoguRunType && dotenvDoguRunType && appConfigDoguRunType !== dotenvDoguRunType) {
      fs.rmSync(configsPath, { recursive: true, force: true });
    }
  }
  fs.mkdirSync(configsPath, { recursive: true });
}

export interface AppConfigLoaderOptions extends DotEnvMergerOptions, Omit<AppConfigServiceOptions, 'client'> {
  configsPath: string;
  appName: string;
  logger: Logger;
}

export class AppConfigLoader {
  constructor(private readonly options: AppConfigLoaderOptions) {}

  loadSync(): AppConfigService {
    const { options } = this;
    const { appName, configsPath, logger } = this.options;

    const dotenvMerger = new DotenvMerger(options);
    clearConfigsIfInvalid(dotenvMerger, configsPath, appName, logger);

    const appNameResolved = resolveAppName(appName);
    const client = new Conf<AppConfigSchema>({
      configName: appNameResolved,
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
    dotenvMerger.merge(service, logger);
    return service;
  }
}
