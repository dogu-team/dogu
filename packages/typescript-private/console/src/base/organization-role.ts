import { OrganizationId, OrganizationRoleId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface OrganizationRoleBaseTraits {
  organizationRoleId: OrganizationRoleId;
  organizationId: OrganizationId | null;
  name: string;
  customise: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type OrganizationRoleBase = OrganizationRoleBaseTraits;
export const OrganizationRolePropCamel = propertiesOf<OrganizationRoleBase>();
export const OrganizationRolePropSnake = camelToSnakeCasePropertiesOf<OrganizationRoleBase>();
