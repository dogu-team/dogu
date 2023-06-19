import { CreateProjectRoleDtoBase, FindProjectRoleDtoBase, UpdateProjectRoleDtoBase } from '@dogu-private/console';
import { PROJECT_ROLE_NAME_MAX_LENGTH, PROJECT_ROLE_NAME_MIN_LENGTH } from '@dogu-private/types';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PageDto } from '../../common/dto/pagination/page.dto';

export class CreateProjectRoleDto implements CreateProjectRoleDtoBase {
  @IsNotEmpty()
  @IsString()
  @MinLength(PROJECT_ROLE_NAME_MIN_LENGTH)
  @MaxLength(PROJECT_ROLE_NAME_MAX_LENGTH)
  name!: string;
}

export class UpdateProjectRoleDto implements UpdateProjectRoleDtoBase {
  @IsNotEmpty()
  @IsString()
  @MinLength(PROJECT_ROLE_NAME_MIN_LENGTH)
  @MaxLength(PROJECT_ROLE_NAME_MAX_LENGTH)
  name!: string;
}

export class FindProjectRoleDto extends PageDto implements FindProjectRoleDtoBase {
  @IsOptional()
  @IsString()
  @Type(() => String)
  keyword = '';
}

// export class AddProjectRoleDto implements AddProjectRoleDtoBase {
//   @IsNotEmpty()
//   @IsString()
//   projectRoleId!: ProjectRoleId;
// }
