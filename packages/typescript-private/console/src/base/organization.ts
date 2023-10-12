import { OrganizationId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { LiveSessionBase, UserAndInvitationTokenBase } from '..';
import { DeviceBase } from './device';
import { DeviceTagBase } from './device-tag';
import { HostBase } from './host';
import { OrganizationAndUserAndOrganizationRoleBase } from './organization-and-user-and-organization-role';
import { OrganizationUserAndTeamBase } from './organization-and-user-and-team';
import { OrganizationSlackBase } from './organization-slack';
import { ProjectBase } from './project';
import { TeamBase } from './team';
import { UserBase } from './user';

export interface OrganizationRelationTraits {
  hosts?: HostBase[];
  projects?: ProjectBase[];
  users?: UserBase[];
  teams?: TeamBase[];
  organizationAndUserAndOrganizationRoles?: OrganizationAndUserAndOrganizationRoleBase[];
  organizationAndUserAndTeams?: OrganizationUserAndTeamBase[];
  deviceTags?: DeviceTagBase[];
  devices?: DeviceBase[];
  userInvitations?: UserAndInvitationTokenBase[];
  organizationSlack?: OrganizationSlackBase[];
  liveSessions?: LiveSessionBase[];
}

export interface OrganizationResponseTraits {
  owner?: UserBase;
}

export interface OrganizationBaseTraits {
  organizationId: OrganizationId;
  name: string;
  profileImageUrl: string | null;
  shareable: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type OrganizationBase = OrganizationBaseTraits & OrganizationRelationTraits & OrganizationResponseTraits;
export const OrganizationPropCamel = propertiesOf<OrganizationBase>();
export const OrganizationPropSnake = camelToSnakeCasePropertiesOf<OrganizationBase>();
