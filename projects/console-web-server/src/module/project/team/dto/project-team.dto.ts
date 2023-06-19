import { AddTeamToProjectDtoBase, UpdateTeamProjectRoleDtoBase } from '@dogu-private/console';
import { ProjectRoleId, TeamId } from '@dogu-private/types';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddTeamToProjectDto implements AddTeamToProjectDtoBase {
  @IsNotEmpty()
  @IsNumber()
  teamId!: TeamId;

  @IsNotEmpty()
  @IsNumber()
  projectRoleId!: ProjectRoleId;
}

export class UpdateTeamProjectRoleDto implements UpdateTeamProjectRoleDtoBase {
  @IsNotEmpty()
  @IsNumber()
  projectRoleId!: ProjectRoleId;
}
