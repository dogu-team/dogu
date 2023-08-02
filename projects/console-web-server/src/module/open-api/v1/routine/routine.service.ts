import { V1CreatePipelineResponseBody, V1FindPipelineByPipelineIdResponseBody, V1PIPELINE_STATE_KEY } from '@dogu-private/console-open-api';
import { CREATOR_TYPE, getPipelineStateKey, ProjectId, RoutineId, RoutinePipelineId, UserId } from '@dogu-private/types';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoutinePipeline } from '../../../../db/entity/pipeline.entity';
import { Project } from '../../../../db/entity/project.entity';
import { env } from '../../../../env';
import { CancelPipelineEvent, CancelPipelineQueue } from '../../../event/pipeline/update-pipeline-queue';
import { PipelineService } from '../../../routine/pipeline/pipeline.service';

@Injectable()
export class V1RoutineService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(PipelineService)
    private readonly pipelineService: PipelineService,
    @Inject(CancelPipelineQueue)
    private readonly cancelPipelineQueue: CancelPipelineQueue,
  ) {}

  async createPipeline(
    projectId: ProjectId, //
    routineId: RoutineId,
    creatorType: CREATOR_TYPE,
    creatorId: UserId | null,
  ): Promise<V1CreatePipelineResponseBody> {
    const project = await this.dataSource.getRepository(Project).findOne({ where: { projectId } });
    const orgId = project!.organizationId;

    const routinePipeline = await this.pipelineService.createPipelineByRoutineConfig(orgId, projectId, routineId, creatorId, creatorType);
    const resultUrl = `${env.DOGU_CONSOLE_URL}/dashboard/${orgId}/projects/${projectId}/routines/${routinePipeline.routinePipelineId}`;

    const rv: V1CreatePipelineResponseBody = {
      routinePipelineId: routinePipeline.routinePipelineId,
      projectId: routinePipeline.projectId,
      routineId: routinePipeline.routineId!,
      index: routinePipeline.index,
      creatorType: routinePipeline.creatorType,
      creatorId: routinePipeline.creatorId,
      createdAt: routinePipeline.createdAt,
      resultUrl,
    };
    return rv;
  }

  async getRoutinePipeline(routinePipelineId: RoutinePipelineId): Promise<V1FindPipelineByPipelineIdResponseBody> {
    const pipeline = await this.dataSource.getRepository(RoutinePipeline).findOne({ where: { routinePipelineId } });

    const projectId = pipeline!.projectId;
    const pipelineId = pipeline!.routinePipelineId;
    const orgId = (await this.dataSource.getRepository(Project).findOne({ where: { projectId } }))!.organizationId;
    const resultUrl = `${env.DOGU_CONSOLE_URL}/dashboard/${orgId}/projects/${projectId}/routines/${pipelineId}`;

    const rv: V1FindPipelineByPipelineIdResponseBody = {
      routinePipelineId: pipeline!.routinePipelineId,
      projectId: pipeline!.projectId,
      routineId: pipeline!.routineId!,
      index: pipeline!.index,
      state: getPipelineStateKey(pipeline!.status),
      creatorType: pipeline!.creatorType,
      creatorId: pipeline!.creatorId,
      cancelerId: pipeline!.cancelerId,
      createdAt: pipeline!.createdAt,
      inProgressAt: pipeline!.inProgressAt,
      completedAt: pipeline!.completedAt,
      resultUrl,
    };
    return rv;
  }

  async cancelRoutinePipeline(projectId: ProjectId, routinePipelineId: RoutinePipelineId): Promise<void> {
    const event: CancelPipelineEvent = new CancelPipelineEvent(projectId, routinePipelineId, null);
    this.cancelPipelineQueue.enqueue(event);
  }

  isCompleted(state: V1PIPELINE_STATE_KEY): boolean {
    return (
      state === 'SUCCESS' || //
      state === 'FAILURE' ||
      state === 'CANCELLED' ||
      state === 'SKIPPED'
    );
  }
}
