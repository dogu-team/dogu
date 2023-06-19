import { DestBase, DestPropCamel, DestSummaryResponse, OrganizationPropCamel, RuntimeInfoResponse, TestLogResponse } from '@dogu-private/console';
import { DestId, OrganizationId, ProjectId, RoutineDeviceJobId, RoutineJobId, RoutinePipelineId, RoutineStepId } from '@dogu-private/types';
import { Controller, Get, Inject, Param } from '@nestjs/common';
import { PROJECT_ROLE } from '../../../auth/auth.types';
import { ProjectPermission } from '../../../auth/decorators';
import { DestService } from './dest.service';

@Controller('organizations/:organizationId/projects/:projectId/pipelines/:pipelineId/jobs/:jobId/device-jobs/:deviceJobId/steps/:stepId/dests')
export class DestController {
  constructor(
    @Inject(DestService)
    private readonly destService: DestService,
  ) {}

  @Get(':destId/runtime-info')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findDestRuntimeInfo(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
    @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
    @Param('destId') destId: DestId,
  ): Promise<RuntimeInfoResponse> {
    const result = await this.destService.findDestRuntimeInfo(organizationId, deviceJobId, destId);
    return result;
  }

  @Get('')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findDestsByStepId(
    // @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    // @Param('projectId') projectId: ProjectId,
    // @Param('pipelineId') pipelineId: PipelineId,
    // @Param('jobId') jobId: JobId,
    // @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
    @Param('stepId') stepId: RoutineStepId,
  ): Promise<DestBase[]> {
    const result = await this.destService.findDestsByStepId(stepId);
    return result;
  }

  @Get(':destId/logs')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findCompletedStepLog(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
    @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
    @Param('stepId') stepId: RoutineStepId,
    @Param(DestPropCamel.destId) destId: DestId,
  ): Promise<TestLogResponse> {
    const result = await this.destService.findCompletedDestLogs(organizationId, projectId, pipelineId, jobId, deviceJobId, destId);
    return result;
  }

  @Get('summary')
  @ProjectPermission(PROJECT_ROLE.READ)
  async getDestSummary(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
    @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
    @Param('stepId') stepId: RoutineStepId,
  ): Promise<DestSummaryResponse> {
    const rv = await this.destService.getDestSummary(organizationId, projectId, pipelineId, jobId, deviceJobId, stepId);
    return rv;
  }
}
