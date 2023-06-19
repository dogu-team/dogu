import { DeviceJobProfileInfoQueryBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, RoutineDeviceJobId, RoutineJobId, RoutinePipelineId } from '@dogu-private/types';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class DeviceJobProfileInfoQueryDto implements DeviceJobProfileInfoQueryBase {
  @IsNotEmpty()
  @IsString()
  organizationId!: OrganizationId;

  @IsNotEmpty()
  @IsString()
  projectId!: ProjectId;

  @IsNotEmpty()
  @IsNumberString()
  pipelineId!: RoutinePipelineId;

  @IsNotEmpty()
  @IsNumberString()
  jobId!: RoutineJobId;

  @IsNotEmpty()
  @IsNumberString()
  deviceJobId!: RoutineDeviceJobId;
}
