import { DeviceId, OrganizationId, ProjectId, RoutineDeviceJobId, RoutineJobId, RoutinePipelineId } from '@dogu-private/types';

export interface DeviceStreamingQueryDtoBase {
  organizationId: OrganizationId;
  deviceId: DeviceId;
}

export interface DeviceJobLogQueryBase {
  organizationId: OrganizationId;
  projectId: ProjectId;
  pipelineId: RoutinePipelineId;
  jobId: RoutineJobId;
  deviceJobId: RoutineDeviceJobId;
}

export interface PipelineStatusQueryBase {
  organizationId: OrganizationId;
  projectId: ProjectId;
  pipelineId: RoutinePipelineId;
}

export interface DeviceJobProfileInfoQueryBase {
  organizationId: OrganizationId;
  projectId: ProjectId;
  pipelineId: RoutinePipelineId;
  jobId: RoutineJobId;
  deviceJobId: RoutineDeviceJobId;
}
