import { loadFeatureConfigSync, Logger } from '@dogu-tech/node';
import fs from 'fs';
import path from 'path';
import { FeatureTable } from '../../shares/feature-config';
import { AppConfigService } from '../app-config/service';
import { FeatureConfigService } from './service';

const featureSearchPath = path.resolve(__dirname);

export interface FeatureConfigLoaderOptions {
  appConfigService: AppConfigService;
  logger: Logger;
}

export class FeatureConfigLoader {
  constructor(private readonly options: FeatureConfigLoaderOptions) {}

  loadSync(): FeatureConfigService {
    const { appConfigService, logger } = this.options;
    logger.verbose('feature config load');
    let isDirectory = false;
    try {
      isDirectory = fs.statSync(featureSearchPath).isDirectory();
    } catch (e) {}

    if (!isDirectory) {
      throw new Error(`Feature config directory not found: ${featureSearchPath}`);
    }

    const runType = appConfigService.get<string>('DOGU_RUN_TYPE');
    const featureConfig = loadFeatureConfigSync<FeatureTable>(runType, logger, featureSearchPath);
    const service = new FeatureConfigService({
      featureConfig,
    });
    return service;
  }
}
