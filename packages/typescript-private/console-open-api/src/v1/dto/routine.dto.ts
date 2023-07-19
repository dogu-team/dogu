import { CREATOR_TYPE, ProjectId, RoutineId, RoutinePipeline, RoutinePipelineId, UserId } from '@dogu-private/types';

export class V1CreatePipelineResponseBody implements Pick<RoutinePipeline, 'routinePipelineId' | 'projectId' | 'routineId' | 'index' | 'creatorType' | 'creatorId' | 'createdAt'> {
  routinePipelineId!: RoutinePipelineId;
  projectId!: ProjectId;
  routineId!: RoutineId;
  index!: number;
  creatorType!: CREATOR_TYPE;
  creatorId!: UserId | null;
  createdAt!: Date;
}
