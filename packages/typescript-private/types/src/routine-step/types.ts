import { RoutineStepId } from '@dogu-tech/types';
import { RoutineDeviceJobId } from '../routine-device-job';
import { PIPELINE_STATUS } from '../routine-pipeline';

export const ROUTINE_STEP_TABLE_NAME = 'routine_step';

export const ROUTINE_STEP_NAME_MIN_LENGTH = 1;
export const ROUTINE_STEP_NAME_MAX_LENGTH = 45;

export const ROUTINE_STEP_DESC_MIN_LENGTH = 1;
export const ROUTINE_STEP_DESC_MAX_LENGTH = 100;

export const ROUTINE_STEP_USES_MAX_LENGTH = 100;

// export const STEP_LOG_ENDTIME_DELAY_COUNT = 5;
// export const STEP_LOG_LIVE_DELAY_COUNT = 3;

export function makeRecordTime(hour: number, minute: number, second: number): string {
  const time = `${hour}:${minute}:${second}`;
  return time;
}

export interface RoutineStep {
  routineStepId: RoutineStepId;
  routineDeviceJobId: RoutineDeviceJobId;
  name: string;
  status: PIPELINE_STATUS;
  index: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
  localInProgressAt: Date | null;
  localCompletedAt: Date | null;
  heartbeat: Date | null;
  recordStartTime: Date | null;
  recordEndTime: Date | null;
  uses: string | null;
  with: Record<string, unknown> | null;
  run: string | null;
  env: Record<string, string> | null;
  cwd: string;
}
