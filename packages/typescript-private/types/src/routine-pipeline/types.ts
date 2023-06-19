import { ProjectId, RoutineId, UserId } from '..';

export type RoutinePipelineId = number;
export const ROUTINE_PIPELINE_TABLE_NAME = 'routine_pipeline';

export const ROUTINE_PIPELINE_CONFIG_URL_MIN_LENGTH = 1;
export const ROUTINE_PIPELINE_STATUS_LIVE_DELAY_COUNT = 3;

export enum PIPELINE_STATUS {
  UNSPECIFIED = 0,
  WAITING = 1,
  IN_PROGRESS = 2,
  CANCEL_REQUESTED = 3,
  SUCCESS = 4,
  FAILURE = 5,
  CANCELLED = 6,
  SKIPPED = 7,
}

export function isCompleted(state: PIPELINE_STATUS): boolean {
  return (
    state === PIPELINE_STATUS.SUCCESS || //
    state === PIPELINE_STATUS.FAILURE ||
    state === PIPELINE_STATUS.CANCELLED ||
    state === PIPELINE_STATUS.SKIPPED
  );
}

export interface RoutinePipeline {
  routinePipelineId: RoutinePipelineId;
  projectId: ProjectId;
  routineId: RoutineId | null;
  index: number;
  status: PIPELINE_STATUS;
  creatorId: UserId;
  cancelerId: UserId | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
}
// export function isExitable(state: PIPELINE_STATUS): boolean {
//   return (
//     state === PIPELINE_STATUS.IN_PROGRESS || //
//     state === PIPELINE_STATUS.CANCEL_REQUESTED
//   );
// }
