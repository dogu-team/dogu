import { AddUserToProjectDtoBase, UpdateUserProjectRoleDtoBase } from '@dogu-private/console';
import { ProjectRoleId, UserId, USER_ID_MAX_LENGTH } from '@dogu-private/types';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class AddUserToProjectDto implements AddUserToProjectDtoBase {
  @IsNotEmpty()
  @IsString()
  @MaxLength(USER_ID_MAX_LENGTH)
  userId!: UserId;

  @IsNotEmpty()
  @IsNumber()
  projectRoleId!: ProjectRoleId;
}

export class UpdateUserProjectRoleDto implements UpdateUserProjectRoleDtoBase {
  @IsNotEmpty()
  @IsNumber()
  projectRoleId!: ProjectRoleId;
}
