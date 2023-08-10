import { DeviceId, RemoteDeviceJobId, RemoteId, REMOTE_DEVICE_JOB_SESSION_STATE, WebDriverSessionId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase } from './device';
import { RemoteBase } from './remote';
import { RemoteDestBase } from './remote-dest';

interface RemoteDeviceJobRelationTraits {
  remote?: RemoteBase;
  device?: DeviceBase;
  remoteDests?: RemoteDestBase[];
}

export interface RemoteDeviceJobBaseTraits {
  remoteDeviceJobId: RemoteDeviceJobId;
  remoteId: RemoteId;
  deviceId: DeviceId;
  sessionId: WebDriverSessionId | null;
  sessionState: REMOTE_DEVICE_JOB_SESSION_STATE;
  intervalTimeout: number;
  lastIntervalTime: Date;
  seCdp: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
}

export type RemoteDeviceJobBase = RemoteDeviceJobBaseTraits & RemoteDeviceJobRelationTraits;
export const RemoteDeviceJobPropCamel = propertiesOf<RemoteDeviceJobBase>();
export const RemoteDeviceJobPropSnake = camelToSnakeCasePropertiesOf<RemoteDeviceJobBase>();
