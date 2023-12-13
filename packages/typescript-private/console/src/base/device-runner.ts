import { DeviceId, DeviceRunnerId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase } from './device';

export type DeviceRunnerBase = {
  deviceRunnerId: DeviceRunnerId;
  isInUse: number;
  deviceId: DeviceId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  device?: DeviceBase;
};

export const DeviceRunnerPropCamel = propertiesOf<DeviceRunnerBase>();
export const DeviceRunnerPropSnake = camelToSnakeCasePropertiesOf<DeviceRunnerBase>();
