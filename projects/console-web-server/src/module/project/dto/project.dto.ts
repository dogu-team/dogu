import {
  CreatePipelineReportDtoBase,
  CreateProjectDtoBase,
  FindMembersByProjectIdDtoBase,
  FindProjectDeviceDtoBase,
  FindProjectDtoBase,
  FindTeamsByProjectIdDtoBase,
  FindUsersByProjectIdDtoBase,
  UpdateProjectDtoBase,
} from '@dogu-private/console';
import { DeviceConnectionState, ProjectId, PROJECT_DESC_MAX_LENGTH, PROJECT_NAME_MAX_LENGTH, PROJECT_NAME_MIN_LENGTH, UserId } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PageDto } from '../../../module/common/dto/pagination/page.dto';

export class CreateProjectDto implements CreateProjectDtoBase {
  @IsNotEmpty()
  @IsString()
  @MinLength(PROJECT_NAME_MIN_LENGTH)
  @MaxLength(PROJECT_NAME_MAX_LENGTH)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(PROJECT_DESC_MAX_LENGTH)
  description: string = '';
}

export class UpdateProjectDto implements UpdateProjectDtoBase {
  @IsString()
  @MinLength(PROJECT_NAME_MIN_LENGTH)
  @MaxLength(PROJECT_NAME_MAX_LENGTH)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(PROJECT_DESC_MAX_LENGTH)
  description: string = '';
}

export class FindProjectDto extends PageDto implements FindProjectDtoBase {
  @IsOptional()
  @IsString()
  keyword = '';
}

export class FindProjectDeviceDto extends PageDto implements FindProjectDeviceDtoBase {
  @IsOptional()
  @IsString()
  keyword = '';

  @IsOptional()
  @Type(() => Number)
  @IsEnum(DeviceConnectionState)
  connectionState?: DeviceConnectionState;
}

export class FindUsersByProjectIdDto extends PageDto implements FindUsersByProjectIdDtoBase {
  @IsOptional()
  @IsString()
  keyword = '';
}

export class FindTeamsByProjectIdDto extends PageDto implements FindTeamsByProjectIdDtoBase {
  @IsOptional()
  @IsString()
  keyword = '';
}

export class FindMembersByProjectIdDto extends PageDto implements FindMembersByProjectIdDtoBase {
  @IsOptional()
  @IsString()
  keyword = '';
}
export class FindProjectRoleDto {
  userId!: UserId;
  projectId!: ProjectId;
  controller!: string;
  action!: string;
  method!: string;
}

export class CreatePipelineReportDto implements CreatePipelineReportDtoBase {
  @IsNotEmpty()
  @IsISO8601()
  from!: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}

export class GetProjectRepositoryFileDto {
  @IsNotEmpty()
  @IsString()
  path!: string;
}

export class GetProjectScriptMetaDto {
  @IsOptional()
  @IsIn(['tree', 'blob'])
  type!: 'tree' | 'blob';
}
