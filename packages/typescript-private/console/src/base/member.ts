import { ProjectAndTeamAndProjectRoleBase } from './project-and-team-and-project-role';
import { ProjectAndUserAndProjectRoleBase } from './project-and-user-and-project-role';
import { TeamBase } from './team';
import { UserBase } from './user';

export type MemberBase = UserBase | TeamBase;

export type MemberAndRoleGroupBase = ProjectAndUserAndProjectRoleBase | ProjectAndTeamAndProjectRoleBase;
