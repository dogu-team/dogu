import { DeviceJobLogQueryBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, RoutineDeviceJobId, RoutineJobId, RoutinePipelineId } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DeviceJobLogQueryDto implements DeviceJobLogQueryBase {
  @IsNotEmpty()
  @IsString()
  organizationId!: OrganizationId;

  @IsNotEmpty()
  @IsString()
  projectId!: ProjectId;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  pipelineId!: RoutinePipelineId;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  jobId!: RoutineJobId;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  deviceJobId!: RoutineDeviceJobId;
}
