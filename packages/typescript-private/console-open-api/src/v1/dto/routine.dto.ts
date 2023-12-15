import { CREATOR_TYPE, PIPELINE_STATUS, ProjectId, RoutineId, RoutinePipeline, RoutinePipelineId, UserId } from '@dogu-private/types';

export class V1CreatePipelineResponseBody implements Pick<RoutinePipeline, 'routinePipelineId' | 'projectId' | 'routineId' | 'index' | 'creatorType' | 'creatorId' | 'createdAt'> {
  routinePipelineId!: RoutinePipelineId;
  projectId!: ProjectId;
  routineId!: RoutineId;
  index!: number;
  creatorType!: CREATOR_TYPE;
  creatorId!: UserId | null;
  createdAt!: Date;
  resultUrl!: string;
}

export enum V1PIPELINE_STATUS {
  UNSPECIFIED = PIPELINE_STATUS.UNSPECIFIED,
  WAITING = PIPELINE_STATUS.WAITING,
  IN_PROGRESS = PIPELINE_STATUS.IN_PROGRESS,
  CANCEL_REQUESTED = PIPELINE_STATUS.CANCEL_REQUESTED,
  SUCCESS = PIPELINE_STATUS.SUCCESS,
  FAILURE = PIPELINE_STATUS.FAILURE,
  CANCELLED = PIPELINE_STATUS.CANCELLED,
  SKIPPED = PIPELINE_STATUS.SKIPPED,
  WAITING_TO_START = PIPELINE_STATUS.WAITING_TO_START,
}

export type V1PIPELINE_STATE_KEY = keyof typeof V1PIPELINE_STATUS;
export class V1FindPipelineByPipelineIdResponseBody
  implements
    Pick<RoutinePipeline, 'routinePipelineId' | 'projectId' | 'routineId' | 'index' | 'creatorType' | 'creatorId' | 'cancelerId' | 'createdAt' | 'inProgressAt' | 'completedAt'>
{
  routinePipelineId!: RoutinePipelineId;
  projectId!: ProjectId;
  routineId!: RoutineId;
  index!: number;
  state!: V1PIPELINE_STATE_KEY;
  creatorType!: CREATOR_TYPE;
  creatorId!: UserId | null;
  cancelerId!: UserId | null;
  createdAt!: Date;
  inProgressAt!: Date | null;
  completedAt!: Date | null;
  resultUrl!: string;
}
