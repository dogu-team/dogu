import { OrganizationId, OrganizationRoleId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { OrganizationBase } from './organization';
import { OrganizationRoleBase } from './organization-role';
import { UserBase } from './user';

export interface OrganizationAndUserAndOrganizationRoleRelationTraits {
  user?: UserBase;
  organization?: OrganizationBase;
  organizationRole?: OrganizationRoleBase;
}

export interface OrganizationAndUserAndOrganizationRoleBaseTraits {
  organizationId: OrganizationId;
  userId: UserId;
  organizationRoleId: OrganizationRoleId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type OrganizationAndUserAndOrganizationRoleBase = OrganizationAndUserAndOrganizationRoleBaseTraits & OrganizationAndUserAndOrganizationRoleRelationTraits;
export const OrganizationAndUserAndOrganizationRolePropCamel = propertiesOf<OrganizationAndUserAndOrganizationRoleBase>();
export const OrganizationAndUserAndOrganizationRolePropSnake = camelToSnakeCasePropertiesOf<OrganizationAndUserAndOrganizationRoleBase>();
