import { RoutinePropCamel } from '@dogu-private/console';
import { V1CreatePipelineResponseBody, V1Routine } from '@dogu-private/console-open-api';
import { CREATOR_TYPE, ProjectId, RoutineId, V1CALLER_TYPE, V1OpenApiPayload } from '@dogu-private/types';
import { Controller, Inject, Param, Post } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Project } from '../../../../db/entity/project.entity';
import { V1OpenApiCaller } from '../../../auth/decorators';
import { PipelineService } from '../../../routine/pipeline/pipeline.service';

@Controller(V1Routine.controller.path)
export class RoutineV1Controller {
  constructor(
    @Inject(PipelineService)
    private readonly pipelineService: PipelineService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Post(V1Routine.createPipeline.path)
  // FIXME:(felix) token validation
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
    const rv: V1CreatePipelineResponseBody = {
      routinePipelineId: routinePipeline.routinePipelineId,
      projectId: routinePipeline.projectId,
      routineId: routinePipeline.routineId!,
      index: routinePipeline.index,
      creatorId: routinePipeline.creatorId,
      createdAt: routinePipeline.createdAt,
    };
    return rv;
  }
}
