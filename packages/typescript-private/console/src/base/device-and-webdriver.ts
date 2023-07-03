import { DeviceId, DeviceWebDriverId, WebDriverSessionId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface DeviceAndWebDriverRelationTraits {
  deviceWebDriverId: DeviceWebDriverId;
  sessionId: WebDriverSessionId;
  deviceId: DeviceId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type DeviceAndWebDriverBase = DeviceAndWebDriverRelationTraits;
export const DeviceAndWebDriverPropCamel = propertiesOf<DeviceAndWebDriverRelationTraits>();
export const DeviceAndWebDriverPropSnake = camelToSnakeCasePropertiesOf<DeviceAndWebDriverRelationTraits>();
