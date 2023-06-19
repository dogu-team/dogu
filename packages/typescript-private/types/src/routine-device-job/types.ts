import { DeviceId } from '@dogu-tech/types';
import { RoutineJobId } from '../routine-job';
import { PIPELINE_STATUS } from '../routine-pipeline';

export type RoutineDeviceJobId = number;
export const ROUTINE_DEVICE_JOB_TABLE_NAME = 'routine_device_job';

// export const ROUTINE_DEVICE_RUNNING_JOB_NAME_MIN_LENGTH = 1;
// export const ROUTINE_DEVICE_RUNNING_JOB_NAME_MAX_LENGTH = 100;
// export const ROUTINE_DEVICE_RECORD_URL_MAX_LENGTH = 512;

export interface RoutineDeviceJob {
  routineDeviceJobId: RoutineDeviceJobId;
  routineJobId: RoutineJobId;
  deviceId: DeviceId;
  status: PIPELINE_STATUS;
  record: number;
  heartbeat: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
  localInProgressAt: Date | null;
  localCompletedAt: Date | null;
}
