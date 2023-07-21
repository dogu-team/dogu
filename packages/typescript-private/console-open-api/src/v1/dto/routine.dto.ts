import { CREATOR_TYPE, PIPELINE_STATE_KEY, ProjectId, RoutineId, RoutinePipeline, RoutinePipelineId, UserId } from '@dogu-private/types';

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

export class V1FindPipelineByPipelineIdResponseBody
  implements
    Pick<RoutinePipeline, 'routinePipelineId' | 'projectId' | 'routineId' | 'index' | 'creatorType' | 'creatorId' | 'cancelerId' | 'createdAt' | 'inProgressAt' | 'completedAt'>
{
  routinePipelineId!: RoutinePipelineId;
  projectId!: ProjectId;
  routineId!: RoutineId;
  index!: number;
  state!: PIPELINE_STATE_KEY;
  creatorType!: CREATOR_TYPE;
  creatorId!: UserId | null;
  cancelerId!: UserId | null;
  createdAt!: Date;
  inProgressAt!: Date | null;
  completedAt!: Date | null;
  resultUrl!: string;
}
