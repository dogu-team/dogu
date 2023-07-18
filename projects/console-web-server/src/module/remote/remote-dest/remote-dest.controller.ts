import { Controller, Inject } from '@nestjs/common';
// import { PROJECT_ROLE } from '../../../auth/auth.types';
// import { ProjectPermission } from '../../../auth/decorators';
import { RemoteDestService } from './remote-dest.service';

@Controller('organizations/:organizationId/projects/:projectId/remote-device-jobs/:remoteDeviceJobId/remote-dests')
export class RemoteDestController {
  constructor(
    @Inject(RemoteDestService)
    private readonly remoteDestService: RemoteDestService,
  ) {}

  // @Get(':destId/runtime-info')
  // @ProjectPermission(PROJECT_ROLE.READ)
  // async findDestRuntimeInfo(
  //   @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
  //   @Param('projectId') projectId: ProjectId,
  //   @Param('pipelineId') pipelineId: RoutinePipelineId,
  //   @Param('jobId') jobId: RoutineJobId,
  //   @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
  //   @Param('destId') destId: DestId,
  // ): Promise<RuntimeInfoResponse> {
  //   const result = await this.destService.findDestRuntimeInfo(organizationId, deviceJobId, destId);
  //   return result;
  // }

  // @Get('')
  // @ProjectPermission(PROJECT_ROLE.READ)
  // async findDestsByStepId(
  //   // @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
  //   // @Param('projectId') projectId: ProjectId,
  //   // @Param('pipelineId') pipelineId: PipelineId,
  //   // @Param('jobId') jobId: JobId,
  //   // @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
  //   @Param('stepId') stepId: RoutineStepId,
  // ): Promise<DestBase[]> {
  //   const result = await this.destService.findDestsByStepId(stepId);
  //   return result;
  // }

  // @Get(':destId/logs')
  // @ProjectPermission(PROJECT_ROLE.READ)
  // async findCompletedStepLog(
  //   @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
  //   @Param('projectId') projectId: ProjectId,
  //   @Param('pipelineId') pipelineId: RoutinePipelineId,
  //   @Param('jobId') jobId: RoutineJobId,
  //   @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
  //   @Param('stepId') stepId: RoutineStepId,
  //   @Param(DestPropCamel.destId) destId: DestId,
  // ): Promise<TestLogResponse> {
  //   const result = await this.destService.findCompletedDestLogs(organizationId, projectId, pipelineId, jobId, deviceJobId, destId);
  //   return result;
  // }

  // @Get('summary')
  // @ProjectPermission(PROJECT_ROLE.READ)
  // async getDestSummary(
  //   @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
  //   @Param('projectId') projectId: ProjectId,
  //   @Param('pipelineId') pipelineId: RoutinePipelineId,
  //   @Param('jobId') jobId: RoutineJobId,
  //   @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
  //   @Param('stepId') stepId: RoutineStepId,
  // ): Promise<DestSummaryResponse> {
  //   const rv = await this.destService.getDestSummary(organizationId, projectId, pipelineId, jobId, deviceJobId, stepId);
  //   return rv;
  // }
}
