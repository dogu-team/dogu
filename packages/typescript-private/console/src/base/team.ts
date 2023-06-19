import { OrganizationId, TeamId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { OrganizationBase } from './organization';
import { OrganizationUserAndTeamBase } from './organization-and-user-and-team';
import { ProjectBase } from './project';
import { ProjectAndTeamAndProjectRoleBase } from './project-and-team-and-project-role';
import { UserBase } from './user';

export interface TeamRelationTraits {
  users?: UserBase[];
  projects?: ProjectBase[];
  projectAndTeamAndProjectRoles?: ProjectAndTeamAndProjectRoleBase[];
  organization?: OrganizationBase;
  organizationAndUserAndTeams?: OrganizationUserAndTeamBase[];
}

export interface TeamBaseTraits {
  teamId: TeamId;
  name: string;
  organizationId: OrganizationId;
  createdAt: Date;
  updatedAt: Date;
}

export type TeamBase = TeamBaseTraits & TeamRelationTraits;
export const TeamPropCamel = propertiesOf<TeamBase>();
export const TeamPropSnake = camelToSnakeCasePropertiesOf<TeamBase>();
