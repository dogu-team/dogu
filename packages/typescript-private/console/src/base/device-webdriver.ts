import { DeviceId, DeviceWebDriverId, WebDriverSessionId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface DeviceWebDriverBaseTraits {
  deviceWebDriverId: DeviceWebDriverId;
  sessionId: WebDriverSessionId;
  deviceId: DeviceId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type DeviceWebDriverBase = DeviceWebDriverBaseTraits;
export const DeviceWebDriverPropCamel = propertiesOf<DeviceWebDriverBase>();
export const DeviceWebDriverPropSnake = camelToSnakeCasePropertiesOf<DeviceWebDriverBase>();
