import { DeviceId, RemoteDeviceJobId, RemoteId, REMOTE_DEVICE_JOB_STATE, WebDriverSessionId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase } from './device';
import { RemoteBase } from './remote';

interface RemoteDeviceJobRelationTraits {
  remote?: RemoteBase;
  device?: DeviceBase;
}

export interface RemoteDeviceJobBaseTraits {
  remoteDeviceJobId: RemoteDeviceJobId;
  remoteId: RemoteId;
  deviceId: DeviceId;
  sessionId: WebDriverSessionId | null;
  state: REMOTE_DEVICE_JOB_STATE;
  intervalTimeout: number;
  lastIntervalTime: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
}

export type RemoteDeviceJobBase = RemoteDeviceJobBaseTraits & RemoteDeviceJobRelationTraits;
export const RemoteDeviceJobPropCamel = propertiesOf<RemoteDeviceJobBase>();
export const RemoteDeviceJobPropSnake = camelToSnakeCasePropertiesOf<RemoteDeviceJobBase>();
