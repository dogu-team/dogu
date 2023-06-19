import { OrganizationId, TeamId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { OrganizationBase } from './organization';
import { TeamBase } from './team';
import { UserBase } from './user';

export interface OrganizationUserAndTeamRelationTraits {
  user?: UserBase;
  team?: TeamBase;
  organization?: OrganizationBase;
}
export interface OrganizationUserAndTeamBaseTraits {
  userId: UserId;
  teamId: TeamId;
  organizationId: OrganizationId;
  createdAt: Date;
  deletedAt: Date | null;
}

export type OrganizationUserAndTeamBase = OrganizationUserAndTeamBaseTraits & OrganizationUserAndTeamRelationTraits;
export const OrganizationUserAndTeamPropCamel = propertiesOf<OrganizationUserAndTeamBase>();
export const OrganizationUserAndTeamPropSnake = camelToSnakeCasePropertiesOf<OrganizationUserAndTeamBase>();
