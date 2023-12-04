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

export type PIPELINE_STATE_KEY = keyof typeof PIPELINE_STATUS;

export function getPipelineStateKey(state: PIPELINE_STATUS): PIPELINE_STATE_KEY {
  switch (state) {
    case PIPELINE_STATUS.UNSPECIFIED:
      return 'UNSPECIFIED';
    case PIPELINE_STATUS.WAITING:
      return 'WAITING';
    case PIPELINE_STATUS.IN_PROGRESS:
      return 'IN_PROGRESS';
    case PIPELINE_STATUS.CANCEL_REQUESTED:
      return 'CANCEL_REQUESTED';
    case PIPELINE_STATUS.SUCCESS:
      return 'SUCCESS';
    case PIPELINE_STATUS.FAILURE:
      return 'FAILURE';
    case PIPELINE_STATUS.CANCELLED:
      return 'CANCELLED';
    case PIPELINE_STATUS.SKIPPED:
      return 'SKIPPED';
    default:
      const _exaustiveCheck: never = state;
      throw new Error(`Unexpected state: ${_exaustiveCheck}`);
  }
}

export enum CREATOR_TYPE {
  UNSPECIFIED = 0,
  ORGANIZATION = 1,
  PROJECT = 2,
  USER = 3,
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
  creatorType: CREATOR_TYPE;
  repository: string;
  creatorId: UserId | null;
  cancelerId: UserId | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
}
