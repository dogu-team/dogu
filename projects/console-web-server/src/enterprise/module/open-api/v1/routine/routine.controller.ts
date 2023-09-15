import { RoutinePipelinePropCamel, RoutinePropCamel } from '@dogu-private/console';
import { V1CreatePipelineResponseBody, V1FindPipelineByPipelineIdResponseBody, V1Routine } from '@dogu-private/console-open-api';
import { CREATOR_TYPE, ProjectId, RoutineId, RoutinePipelineId, V1CALLER_TYPE, V1OpenApiPayload } from '@dogu-private/types';
import { Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { LICENSE_AUTHROIZE, PROJECT_ROLE } from '../../../../../module/auth/auth.types';
import { LicensePermission, V1OpenApiCaller, V1OpenApiProjectPermission } from '../../../../../module/auth/decorators';
import { V1RoutineService } from './routine.service';

@Controller(V1Routine.controller.path)
export class V1RoutineController {
  constructor(
    @Inject(V1RoutineService)
    private readonly v1RoutineService: V1RoutineService,
  ) {}

  @Get(V1Routine.findPipelineByPipelineId.path)
  @V1OpenApiProjectPermission(PROJECT_ROLE.READ)
  @LicensePermission(LICENSE_AUTHROIZE.OPEN_API)
  async findPipelineByPipelineId(
    @Param(RoutinePipelinePropCamel.routinePipelineId) routinePipelineId: RoutinePipelineId, //
    @V1OpenApiCaller() openApiCaller: V1OpenApiPayload,
  ): Promise<V1FindPipelineByPipelineIdResponseBody> {
    const rv = await this.v1RoutineService.getRoutinePipeline(routinePipelineId);
    return rv;
  }

  @Post(V1Routine.createPipeline.path)
  @V1OpenApiProjectPermission(PROJECT_ROLE.WRITE)
  @LicensePermission(LICENSE_AUTHROIZE.OPEN_API)
  async createPipeline(
    @Param(RoutinePropCamel.projectId) projectId: ProjectId, //
    @Param(RoutinePropCamel.routineId) routineId: RoutineId, //
    @V1OpenApiCaller() openApiCaller: V1OpenApiPayload,
  ): Promise<V1CreatePipelineResponseBody> {
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

    const rv = await this.v1RoutineService.createPipeline(projectId, routineId, creatorType, creatorId);
    return rv;
  }
}
