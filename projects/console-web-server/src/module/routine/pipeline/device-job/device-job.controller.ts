import { OrganizationPropCamel, RoutineDeviceJobBase, RuntimeInfoResponse, TestLogResponse } from '@dogu-private/console';
import { OrganizationId, ProjectId, RoutineDeviceJobId, RoutineJobId, RoutinePipelineId } from '@dogu-private/types';
import { Controller, Get, Inject, Param } from '@nestjs/common';

import { PROJECT_ROLE } from '../../../auth/auth.types';
import { ProjectPermission } from '../../../auth/decorators';
import { DeviceJobService } from './device-job.service';

@Controller('organizations/:organizationId/projects/:projectId/pipelines/:pipelineId/jobs/:jobId/device-jobs')
export class DeviceJobController {
  constructor(
    @Inject(DeviceJobService)
    private readonly deviceJobService: DeviceJobService,
  ) {}

  @Get('')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findAllDeviceJobs(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
  ): Promise<RoutineDeviceJobBase[]> {
    const result = await this.deviceJobService.findAllDeviceJobs(organizationId, projectId, pipelineId, jobId);
    return result;
  }

  @Get(':deviceJobId')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findDeviceJobById(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
    @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
  ): Promise<RoutineDeviceJobBase> {
    const result = await this.deviceJobService.findDeviceJobById(organizationId, projectId, pipelineId, jobId, deviceJobId);
    return result;
  }

  @Get(':deviceJobId/details')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findDeviceJobDetailsById(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
    @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
  ): Promise<RoutineDeviceJobBase> {
    const result = await this.deviceJobService.findDeviceJobDetailsById(organizationId, projectId, pipelineId, jobId, deviceJobId);
    return result;
  }

  @Get(':deviceJobId/runtime-info')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findDeviceJobRuntimeInfo(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
    @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
  ): Promise<RuntimeInfoResponse> {
    const result = await this.deviceJobService.findDeviceJobRuntimeInfo(organizationId, deviceJobId);
    return result;
  }

  @Get(':deviceJobId/logs')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findCompletedStepLog(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
    @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
  ): Promise<TestLogResponse> {
    const result = await this.deviceJobService.findCompletedDeviceJobLogs(organizationId, projectId, pipelineId, jobId, deviceJobId);
    return result;
  }

  @Get(':deviceJobId/record')
  @ProjectPermission(PROJECT_ROLE.READ)
  async getDeviceJobRecordUrl(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('projectId') projectId: ProjectId,
    @Param('pipelineId') pipelineId: RoutinePipelineId,
    @Param('jobId') jobId: RoutineJobId,
    @Param('deviceJobId') deviceJobId: RoutineDeviceJobId,
  ): Promise<string> {
    // const range = headers.range;
    // await this.deviceJobService.pipeStreamDeviceJobRecord(organizationId, projectId, pipelineId, deviceJobId, range, res);

    const result = await this.deviceJobService.getDeviceJobRecordUrl(organizationId, projectId, pipelineId, deviceJobId);
    return result;
  }
}
