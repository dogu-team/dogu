import { OrganizationRoleId, UserId } from '@dogu-private/types';

export interface UpdateOrganizationDtoBase {
  name: string;
}

export interface CreateOrganizationDtoBase {
  name: string;
}

export interface UpdateOrganizationOwnerDtoBase {
  userId: UserId;
}

export interface UpdateOrganizationRoleDtoBase {
  organizationRoleId: OrganizationRoleId;
}
