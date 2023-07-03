import { instanceKeys } from './electron-ipc';

export interface FeatureTable {
  useApiUrlInput: boolean;
  useSentry: boolean;
  useAppUpdate: boolean;
}

export type FeatureKey = keyof FeatureTable;
export type FeatureValue<Key extends FeatureKey> = FeatureTable[Key];

export const featureConfigClientKey = instanceKeys<IFeatureConfigClient>('featureConfigClient');

export interface IFeatureConfigClient {
  get: <Key extends FeatureKey>(key: Key) => Promise<FeatureValue<Key>>;
}
