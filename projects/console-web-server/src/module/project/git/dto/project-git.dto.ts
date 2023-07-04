import { UpdateProjectGitDtoBase } from '@dogu-private/console';
import { REPOSITORY_TYPE } from '@dogu-private/types';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateProjectGitDto implements UpdateProjectGitDtoBase {
  @IsNotEmpty()
  @IsEnum(REPOSITORY_TYPE)
  service!: REPOSITORY_TYPE;

  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsNotEmpty()
  @IsString()
  url!: string;
}
