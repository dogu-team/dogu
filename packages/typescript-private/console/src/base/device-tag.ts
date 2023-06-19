import { DeviceTagId, OrganizationId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceAndDeviceTagBase } from '../index';
import { DeviceBase } from './device';
import { OrganizationBase } from './organization';

export interface DeviceTagRelationTraits {
  organization?: OrganizationBase;
  devices?: DeviceBase[];
  deviceAndDeviceTags?: DeviceAndDeviceTagBase[];
}
export interface DeviceTagBaseTraits {
  deviceTagId: DeviceTagId;
  organizationId: OrganizationId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type DeviceTagBase = DeviceTagBaseTraits & DeviceTagRelationTraits;
export const DeviceTagPropCamel = propertiesOf<DeviceTagBase>();
export const DeviceTagPropSnake = camelToSnakeCasePropertiesOf<DeviceTagBase>();
