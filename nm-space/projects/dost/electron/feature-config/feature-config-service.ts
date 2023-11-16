import { FeatureConfigLoader, FeatureConfigService as Impl } from '@dogu-private/dogu-agent-core/app';
import { FeatureKey, FeatureValue } from '@dogu-private/dogu-agent-core/shares';
import { ipcMain } from 'electron';
import { featureConfigClientKey } from '../../src/shares/feature-config';
import { AppConfigService } from '../app-config/app-config-service';
import { logger } from '../log/logger.instance';

export class FeatureConfigService {
  static instance: FeatureConfigService;

  static open(appConfigService: AppConfigService): void {
    const impl = new FeatureConfigLoader({
      appConfigService: appConfigService.impl,
      logger,
    }).loadSync();

    FeatureConfigService.instance = new FeatureConfigService(impl);
    const { instance } = FeatureConfigService;
    ipcMain.handle(featureConfigClientKey.get, (_, key: FeatureKey) => instance.get(key));
  }

  private constructor(readonly impl: Impl) {}

  get<Key extends FeatureKey>(key: Key): FeatureValue<Key> {
    return this.impl.get(key);
  }
}
