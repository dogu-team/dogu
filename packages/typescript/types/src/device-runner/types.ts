import { DeviceId } from '../device/types';

export type DeviceRunnerId = string;
export const DEVICE_RUNNER_TABLE_NAME = 'device_runner';

export interface DeviceRunner {
  deviceRunnerId: DeviceRunnerId;
  isInUse: number;
  deviceId: DeviceId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
