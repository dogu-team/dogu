import { RoutinePipelinePropCamel, RoutinePropCamel } from '@dogu-private/console';
import { V1CreatePipelineResponseBody, V1FindPipelineByPipelineIdResponseBody, V1Routine } from '@dogu-private/console-open-api';
import { CREATOR_TYPE, getPipelineStateKey, ProjectId, RoutineId, RoutinePipelineId, V1CALLER_TYPE, V1OpenApiPayload } from '@dogu-private/types';
import { Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoutinePipeline } from '../../../../db/entity/pipeline.entity';
import { Project } from '../../../../db/entity/project.entity';
import { env } from '../../../../env';
import { PROJECT_ROLE } from '../../../auth/auth.types';
import { V1OpenApiCaller, V1OpenApiProjectPermission } from '../../../auth/decorators';
import { PipelineService } from '../../../routine/pipeline/pipeline.service';

@Controller(V1Routine.controller.path)
export class RoutineV1Controller {
  constructor(
    @Inject(PipelineService)
    private readonly pipelineService: PipelineService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get(V1Routine.findPipelineByPipelineId.path)
  @V1OpenApiProjectPermission(PROJECT_ROLE.READ)
  async findPipelineByPipelineId(
    @Param(RoutinePipelinePropCamel.routinePipelineId) routinePipelineId: RoutinePipelineId, //
    @V1OpenApiCaller() openApiCaller: V1OpenApiPayload,
  ): Promise<V1FindPipelineByPipelineIdResponseBody> {
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

  @Post(V1Routine.createPipeline.path)
  @V1OpenApiProjectPermission(PROJECT_ROLE.WRITE)
  async createPipeline(
    @Param(RoutinePropCamel.projectId) projectId: ProjectId, //
    @Param(RoutinePropCamel.routineId) routineId: RoutineId, //
    @V1OpenApiCaller() openApiCaller: V1OpenApiPayload,
  ): Promise<V1CreatePipelineResponseBody> {
    const project = await this.dataSource.getRepository(Project).findOne({ where: { projectId } });
    const orgId = project!.organizationId;

    let creatorId = null;
    let creatorType: CREATOR_TYPE;
    switch (openApiCaller.callerType) {
      case V1CALLER_TYPE.USER: {
        creatorType = CREATOR_TYPE.USER;
        creatorId = openApiCaller.userId!;
        break;
      }
      case V1CALLER_TYPE.ORGANIZATION: {
        creatorType = CREATOR_TYPE.ORGANIZATION;
        break;
      }
      case V1CALLER_TYPE.PROJECT: {
        creatorType = CREATOR_TYPE.PROJECT;
        break;
      }
      default: {
        const _exaustiveCheck: never = openApiCaller.callerType;
        throw new Error(`Unexpected callerType: ${_exaustiveCheck}`);
        break;
      }
    }

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
}
