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
import { DeviceConnectionState, Platform, ProjectId, PROJECT_DESC_MAX_LENGTH, PROJECT_NAME_MAX_LENGTH, PROJECT_NAME_MIN_LENGTH, PROJECT_TYPE, UserId } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PageDto } from '../../../module/common/dto/pagination/page.dto';

export class CreateProjectDto implements CreateProjectDtoBase {
  @IsNotEmpty()
  @IsString()
  @MinLength(PROJECT_NAME_MIN_LENGTH)
  @MaxLength(PROJECT_NAME_MAX_LENGTH)
  name!: string;

  @IsEnum(PROJECT_TYPE)
  type!: PROJECT_TYPE;

  @MaxLength(PROJECT_DESC_MAX_LENGTH)
  @IsString()
  @IsOptional()
  description: string = '';
}

export class UpdateProjectDto implements UpdateProjectDtoBase {
  @MinLength(PROJECT_NAME_MIN_LENGTH)
  @MaxLength(PROJECT_NAME_MAX_LENGTH)
  @IsString()
  @IsOptional()
  name!: string;

  @IsEnum(PROJECT_TYPE)
  @IsOptional()
  type!: PROJECT_TYPE;

  @MaxLength(PROJECT_DESC_MAX_LENGTH)
  @IsString()
  @IsOptional()
  description: string = '';
}

export class FindProjectDto extends PageDto implements FindProjectDtoBase {
  @IsString()
  @IsOptional()
  keyword = '';

  @IsOptional()
  @Type(() => Number)
  @IsEnum(PROJECT_TYPE)
  type?: PROJECT_TYPE;
}

export class FindProjectDeviceDto extends PageDto implements FindProjectDeviceDtoBase {
  @IsString()
  @IsOptional()
  keyword = '';

  @Type(() => Number)
  @IsEnum(Platform)
  @IsOptional()
  platform?: Platform;

  @Type(() => Number)
  @IsEnum(DeviceConnectionState)
  @IsOptional()
  connectionState?: DeviceConnectionState;
}

export class FindUsersByProjectIdDto extends PageDto implements FindUsersByProjectIdDtoBase {
  @IsString()
  @IsOptional()
  keyword = '';
}

export class FindTeamsByProjectIdDto extends PageDto implements FindTeamsByProjectIdDtoBase {
  @IsString()
  @IsOptional()
  keyword = '';
}

export class FindMembersByProjectIdDto extends PageDto implements FindMembersByProjectIdDtoBase {
  @IsString()
  @IsOptional()
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

  @IsISO8601()
  @IsOptional()
  to?: string;
}

export class GetProjectRepositoryFileDto {
  @IsNotEmpty()
  @IsString()
  path!: string;
}

export class GetProjectScriptMetaDto {
  @IsIn(['tree', 'blob'])
  @IsOptional()
  type!: 'tree' | 'blob';
}
