import { FeatureConfigLoader, FeatureConfigService as Impl } from '@dogu-private/dogu-agent-core/app';
import { FeatureKey, FeatureValue } from '@dogu-private/dogu-agent-core/shares';
import { ipcMain } from 'electron';
import { featureConfigClientKey } from '../../src/shares/feature-config';
import { AppConfigService } from '../app-config/app-config-service';
import { logger } from '../log/logger.instance';

export class FeatureConfigService {
  static instance: FeatureConfigService;

  static async open(appConfigService: AppConfigService): Promise<void> {
    const impl = await new FeatureConfigLoader({
      appConfigService: appConfigService.impl,
      logger,
    }).load();

    FeatureConfigService.instance = new FeatureConfigService(impl);
    const { instance } = FeatureConfigService;
    ipcMain.handle(featureConfigClientKey.get, (_, key: FeatureKey) => instance.get(key));
  }

  private constructor(private readonly impl: Impl) {}

  get<Key extends FeatureKey>(key: Key): FeatureValue<Key> {
    return this.impl.get(key);
  }
}
