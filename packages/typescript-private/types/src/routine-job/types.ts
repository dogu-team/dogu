import { PIPELINE_STATUS, RoutinePipelineId } from '..';

export type RoutineJobId = number;

export const ROUTINE_JOB_NAME_MIN_LENGTH = 1;
export const ROUTINE_JOB_NAME_MAX_LENGTH = 45;

export const ROUTINE_JOB_DESC_MIN_LENGTH = 1;
export const ROUTINE_JOB_DESC_MAX_LENGTH = 100;
export const ROUTINE_JOB_TABLE_NAME = 'routine_job';

export interface RoutineJob {
  routineJobId: RoutineJobId;
  routinePipelineId: RoutinePipelineId;
  name: string;
  status: PIPELINE_STATUS;
  index: number;
  record: number;
  createdAt: Date;
  deletedAt: Date | null;
  updatedAt: Date;
  inProgressAt: Date | null;
  completedAt: Date | null;
}
