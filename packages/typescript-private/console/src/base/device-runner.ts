import { DeviceRunner } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase } from './device';

interface DeviceRunnerRelationTraits {
  device?: DeviceBase;
}

export type DeviceRunnerBase = DeviceRunner & DeviceRunnerRelationTraits;

export const DeviceRunnerPropCamel = propertiesOf<DeviceRunnerBase>();
export const DeviceRunnerPropSnake = camelToSnakeCasePropertiesOf<DeviceRunnerBase>();
