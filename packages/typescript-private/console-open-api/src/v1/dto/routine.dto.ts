import { CREATOR_TYPE, PIPELINE_STATUS, ProjectId, RoutineId, RoutinePipeline, RoutinePipelineId, UserId } from '@dogu-private/types';

export class V1CreatePipelineResponseBody implements Pick<RoutinePipeline, 'routinePipelineId' | 'projectId' | 'routineId' | 'index' | 'creatorType' | 'creatorId' | 'createdAt'> {
  routinePipelineId!: RoutinePipelineId;
  projectId!: ProjectId;
  routineId!: RoutineId;
  index!: number;
  creatorType!: CREATOR_TYPE;
  creatorId!: UserId | null;
  createdAt!: Date;
}

export class V1FindPipelineByPipelineIdResponseBody
  implements
    Pick<
      RoutinePipeline,
      'routinePipelineId' | 'projectId' | 'routineId' | 'index' | 'status' | 'creatorType' | 'creatorId' | 'cancelerId' | 'createdAt' | 'inProgressAt' | 'completedAt'
    >
{
  routinePipelineId!: RoutinePipelineId;
  projectId!: ProjectId;
  routineId!: RoutineId;
  index!: number;
  status!: PIPELINE_STATUS;
  creatorType!: CREATOR_TYPE;
  creatorId!: UserId | null;
  cancelerId!: UserId | null;
  createdAt!: Date;
  inProgressAt!: Date | null;
  completedAt!: Date | null;
}
