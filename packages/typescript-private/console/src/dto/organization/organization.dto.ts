import { OrganizationRoleId, UserId } from '@dogu-private/types';

export interface UpdateOrganizationDtoBase {
  name: string;
  profileImageUrl: string | null;
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
