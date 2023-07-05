import { UpdateProjectGitDtoBase } from '@dogu-private/console';
import { PROJECT_SCM_TYPE } from '@dogu-private/types';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateProjectGitDto implements UpdateProjectGitDtoBase {
  @IsNotEmpty()
  @IsEnum(PROJECT_SCM_TYPE)
  service!: PROJECT_SCM_TYPE;

  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsNotEmpty()
  @IsString()
  url!: string;
}
