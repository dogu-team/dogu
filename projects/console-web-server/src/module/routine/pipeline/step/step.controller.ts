import { OrganizationPropCamel, RuntimeInfoResponse, TestLogResponse } from '@dogu-private/console';
import { OrganizationId, ProjectId, RoutineDeviceJobId, RoutineJobId, RoutinePipelineId, RoutineStepId } from '@dogu-private/types';

import { Controller, Get, Param } from '@nestjs/common';
import { PROJECT_ROLE } from '../../../auth/auth.types';
import { ProjectPermission } from '../../../auth/decorators';
import { StepService } from './step.service';

@Controller('organizations/:organizationId/projects/:projectId/pipelines/:pipelineId/jobs/:jobId/device-jobs/:deviceJobId/steps')
export class StepController {
  constructor(private stepService: StepService) {}

  @Get(':stepId/logs')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findCompletedStepLog(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
    @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
    @Param('stepId') stepId: RoutineStepId,
  ): Promise<TestLogResponse> {
    const result = await this.stepService.findCompletedStepLogs(organizationId, projectId, pipelineId, jobId, deviceJobId, stepId);
    return result;
  }

  @Get(':stepId/runtime-info')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findDeviceJobRuntimeInfo(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
    @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
    @Param('stepId') stepId: RoutineStepId,
  ): Promise<RuntimeInfoResponse> {
    const result = await this.stepService.findStepRuntimeInfo(organizationId, deviceJobId, stepId);
    return result;
  }
}
