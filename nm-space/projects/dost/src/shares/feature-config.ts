import { FeatureKey, FeatureValue } from '@dogu-private/dogu-agent-core/shares';
import { instanceKeys } from './electron-ipc';

export const featureConfigClientKey = instanceKeys<IFeatureConfigClient>('featureConfigClient');

export interface IFeatureConfigClient {
  get: <Key extends FeatureKey>(key: Key) => Promise<FeatureValue<Key>>;
}
