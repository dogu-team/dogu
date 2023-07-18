import { ProjectId, RoutineId, RoutinePipeline, RoutinePipelineId, UserId } from '@dogu-private/types';

export class V1CreatePipelineResponseBody implements Pick<RoutinePipeline, 'routinePipelineId' | 'projectId' | 'routineId' | 'index' | 'creatorId' | 'createdAt'> {
  routinePipelineId!: RoutinePipelineId;
  projectId!: ProjectId;
  routineId!: RoutineId;
  index!: number;
  creatorId!: UserId | null;
  createdAt!: Date;
}
