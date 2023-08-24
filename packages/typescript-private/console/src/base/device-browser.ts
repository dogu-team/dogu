import { DeviceBrowser } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase } from './device';

interface DeviceBrowserRelationTraits {
  device?: DeviceBase;
}

export type DeviceBrowserBase = DeviceBrowser & DeviceBrowserRelationTraits;

export const DeviceBrowserPropCamel = propertiesOf<DeviceBrowserBase>();
export const DeviceBrowserPropSnake = camelToSnakeCasePropertiesOf<DeviceBrowserBase>();
