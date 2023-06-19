import { CloudDeviceId, DeviceId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { CloudDeviceRentalBase } from '..';
import { DeviceBase } from './device';

interface CloudDeviceRelationTraits {
  device?: DeviceBase;
  cloudDeviceRental?: CloudDeviceRentalBase;
}

export interface CloudDeviceBaseTraits {
  cloudDeviceId: CloudDeviceId;
  deviceId: DeviceId;
  createdAt: Date;
  deletedAt: Date | null;
}

export type CloudDeviceBase = CloudDeviceBaseTraits & CloudDeviceRelationTraits;
export const CloudDevicePropCamel = propertiesOf<CloudDeviceBase>();
export const CloudDevicePropSnake = camelToSnakeCasePropertiesOf<CloudDeviceBase>();
