import { loadFeatureConfig, Logger } from '@dogu-tech/node';
import fs from 'fs';
import path from 'path';
import { FeatureTable } from '../../shares/feature-config';
import { AppConfigService } from '../app-config/service';
import { FeatureConfigService } from './service';

const featuresPath = path.resolve(__dirname, 'features');

export interface FeatureConfigLoaderOptions {
  appConfigService: AppConfigService;
  logger: Logger;
}

export class FeatureConfigLoader {
  constructor(private readonly options: FeatureConfigLoaderOptions) {}

  async load(): Promise<FeatureConfigService> {
    const { appConfigService, logger } = this.options;
    logger.verbose('feature config load');

    if (
      !(await fs.promises
        .stat(featuresPath)
        .then((stat) => stat.isDirectory())
        .catch(() => false))
    ) {
      throw new Error(`Feature config directory not found: ${featuresPath}`);
    }

    const runType = appConfigService.get<string>('DOGU_RUN_TYPE');
    const featureConfig = await loadFeatureConfig<FeatureTable>(runType, logger, featuresPath);
    const service = new FeatureConfigService({
      featureConfig,
    });
    return service;
  }
}
