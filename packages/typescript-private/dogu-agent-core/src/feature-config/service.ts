import { FeatureConfig } from '@dogu-tech/node';
import { FeatureKey, FeatureTable, FeatureValue } from './types';

export interface FeatureConfigServiceOptions {
  featureConfig: FeatureConfig<FeatureTable>;
}

export class FeatureConfigService {
  private featureConfig: FeatureConfig<FeatureTable>;

  constructor(options: FeatureConfigServiceOptions) {
    this.featureConfig = options.featureConfig;
  }

  get<Key extends FeatureKey>(key: Key): FeatureValue<Key> {
    return this.featureConfig.get(key);
  }
}
