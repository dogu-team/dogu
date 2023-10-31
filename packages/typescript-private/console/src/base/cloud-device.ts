import { DeviceBase } from './device';

export interface CloudDeviceMetadataBase
  extends Pick<
    DeviceBase,
    'location' | 'model' | 'modelName' | 'manufacturer' | 'resolutionWidth' | 'resolutionHeight' | 'memory' | 'platform' | 'usageState' | 'connectionState'
  > {
  versions: string[];
}

export type CloudDeviceByModelResponse = Pick<DeviceBase, 'version' | 'model' | 'usageState' | 'connectionState'>;
