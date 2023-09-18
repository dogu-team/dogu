import { loadFeatureConfig, Logger } from '@dogu-tech/node';
import { AppConfigService } from '../app-config/service';
import { FeatureConfigService } from './service';
import { FeatureTable } from './types';

export interface FeatureConfigLoaderOptions {
  appConfigService: AppConfigService;
  configDirPath: string;
  logger: Logger;
}

export class FeatureConfigLoader {
  constructor(private readonly options: FeatureConfigLoaderOptions) {}

  async load(): Promise<FeatureConfigService> {
    const { appConfigService, configDirPath, logger } = this.options;
    logger.verbose('feature config load');
    const runType = appConfigService.get<string>('DOGU_RUN_TYPE');
    const featureConfig = await loadFeatureConfig<FeatureTable>(runType, logger, configDirPath);
    const service = new FeatureConfigService({
      featureConfig,
    });
    return service;
  }
}
