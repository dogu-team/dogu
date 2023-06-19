import { DeviceId, DeviceTagId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase } from './device';
import { DeviceTagBase } from './device-tag';

export interface DeviceAndDeviceTagRelationTraits {
  deviceTag?: DeviceTagBase;
  device?: DeviceBase;
}

export interface DeviceAndDeviceTagBaseTraits {
  deviceTagId: DeviceTagId;
  deviceId: DeviceId;
  createdAt: Date;
  deletedAt: Date | null;
}

export type DeviceAndDeviceTagBase = DeviceAndDeviceTagBaseTraits & DeviceAndDeviceTagRelationTraits;
export const DeviceAndDeviceTagPropCamel = propertiesOf<DeviceAndDeviceTagBase>();
export const DeviceAndDeviceTagPropSnake = camelToSnakeCasePropertiesOf<DeviceAndDeviceTagBase>();
