import { FeatureConfig, loadFeatureConfig } from '@dogu-tech/node';
import { ipcMain } from 'electron';
import { featureConfigClientKey, FeatureKey, FeatureTable, FeatureValue } from '../../src/shares/feature-config';
import { AppConfigService } from '../app-config/app-config-service';
import { logger } from '../log/logger.instance';

export class FeatureConfigService {
  static instance: FeatureConfigService;

  static async open(appConfigService: AppConfigService): Promise<void> {
    FeatureConfigService.instance = new FeatureConfigService(appConfigService);
    const { instance } = FeatureConfigService;
    ipcMain.handle(featureConfigClientKey.get, (_, key: FeatureKey) => instance.get(key));
    await instance.load();
  }

  private _featureConfig: FeatureConfig<FeatureTable> | null = null;
  get featureConfig(): FeatureConfig<FeatureTable> {
    if (this._featureConfig === null) {
      throw new Error('feature config not loaded');
    }
    return this._featureConfig;
  }

  private constructor(private readonly appConfigService: AppConfigService) {}

  async load(): Promise<void> {
    logger.verbose('feature config load');
    const runType = await this.appConfigService.get<string>('DOGU_RUN_TYPE');
    const featureConfig = await loadFeatureConfig<FeatureTable>(runType, logger, process.resourcesPath);
    this._featureConfig = featureConfig;
  }

  get<Key extends FeatureKey>(key: Key): FeatureValue<Key> {
    return this.featureConfig.get(key);
  }
}
