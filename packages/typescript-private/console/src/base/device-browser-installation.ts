import { DeviceBrowserInstallation } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase } from './device';

interface DeviceBrowserInstallationRelationTraits {
  device?: DeviceBase;
}

export type DeviceBrowserInstallationBase = DeviceBrowserInstallation & DeviceBrowserInstallationRelationTraits;

export const DeviceBrowserInstallationPropCamel = propertiesOf<DeviceBrowserInstallationBase>();
export const DeviceBrowserInstallationPropSnake = camelToSnakeCasePropertiesOf<DeviceBrowserInstallationBase>();
