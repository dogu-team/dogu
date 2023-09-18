export interface FeatureTable {
  showApiUrlInput: boolean;
  useSentry: boolean;
  useAppUpdate: boolean;
  showTLSAuthReject: boolean;
}

export type FeatureKey = keyof FeatureTable;
export type FeatureValue<Key extends FeatureKey> = FeatureTable[Key];
