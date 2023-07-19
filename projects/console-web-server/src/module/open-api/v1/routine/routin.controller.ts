import { RoutinePipelinePropCamel, RoutinePropCamel } from '@dogu-private/console';
import { V1CreatePipelineResponseBody, V1FindPipelineByPipelineIdResponseBody, V1Routine } from '@dogu-private/console-open-api';
import { CREATOR_TYPE, ProjectId, RoutineId, RoutinePipelineId, V1OpenApiPayload } from '@dogu-private/types';
import { Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoutinePipeline } from '../../../../db/entity/pipeline.entity';
import { Project } from '../../../../db/entity/project.entity';
import { User } from '../../../../db/entity/user.entity';
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

  @Get(V1Routine.findPipelineByPipelineId.path)
  // FIXME:(felix) token validation
  async findPipelineByPipelineId(
    @Param(RoutinePipelinePropCamel.routinePipelineId) routinePipelineId: RoutinePipelineId, //
    @V1OpenApiCaller() openApiCaller: V1OpenApiPayload,
  ): Promise<V1FindPipelineByPipelineIdResponseBody> {
    const pipeline = await this.dataSource.getRepository(RoutinePipeline).findOne({ where: { routinePipelineId } });

    const rv: V1FindPipelineByPipelineIdResponseBody = {
      routinePipelineId: pipeline!.routinePipelineId,
      projectId: pipeline!.projectId,
      routineId: pipeline!.routineId!,
      index: pipeline!.index,
      status: pipeline!.status,
      creatorType: pipeline!.creatorType,
      creatorId: pipeline!.creatorId,
      cancelerId: pipeline!.cancelerId,
      createdAt: pipeline!.createdAt,
      inProgressAt: pipeline!.inProgressAt,
      completedAt: pipeline!.completedAt,
    };
    return rv;
  }

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
    // switch (openApiCaller.callerType) {
    //   case V1CALLER_TYPE.USER: {
    //     creatorType = CREATOR_TYPE.USER;
    //     creatorId = openApiCaller.userId!;
    //     break;
    //   }
    //   case V1CALLER_TYPE.ORGANIZATION: {
    //     creatorType = CREATOR_TYPE.ORGANIZATION;
    //     break;
    //   }
    //   case V1CALLER_TYPE.PROJECT: {
    //     creatorType = CREATOR_TYPE.PROJECT;
    //     break;
    //   }
    //   default: {
    //     const _exaustiveCheck: never = openApiCaller.callerType;
    //     // throw new Error(`Unexpected callerType: ${_exaustiveCheck}`);
    //     break;
    //   }
    // }

    //FIXME:(felix) test code
    const creatorIdTEST = (await this.dataSource.getRepository(User).find())[0];
    const routinePipeline = await this.pipelineService.createPipelineByRoutineConfig(orgId, projectId, routineId, creatorIdTEST.userId, CREATOR_TYPE.USER);

    // const routinePipeline = await this.pipelineService.createPipelineByRoutineConfig(orgId, projectId, routineId, creatorId, creatorType);
    const rv: V1CreatePipelineResponseBody = {
      routinePipelineId: routinePipeline.routinePipelineId,
      projectId: routinePipeline.projectId,
      routineId: routinePipeline.routineId!,
      index: routinePipeline.index,
      creatorType: routinePipeline.creatorType,
      creatorId: routinePipeline.creatorId,
      createdAt: routinePipeline.createdAt,
    };
    return rv;
  }
}
