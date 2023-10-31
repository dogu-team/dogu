import { FeatureConfig as FeatureConfigType, loadFeatureConfigSync } from '@dogu-tech/node';
import { env } from './env';
import { logger } from './module/logger/logger.instance';

export interface FeatureTable {
  niceSandbox: boolean;
}

export const FeatureConfig: FeatureConfigType<FeatureTable> = loadFeatureConfigSync<FeatureTable>(env.DOGU_BILLING_RUN_TYPE, logger);
