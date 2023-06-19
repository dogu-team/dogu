import { PipelineStatusQueryBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, RoutinePipelineId } from '@dogu-private/types';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class PipelineStatusQueryDto implements PipelineStatusQueryBase {
  @IsNotEmpty()
  @IsString()
  organizationId!: OrganizationId;

  @IsNotEmpty()
  @IsString()
  projectId!: ProjectId;

  @IsNotEmpty()
  @IsNumberString()
  pipelineId!: RoutinePipelineId;
}
