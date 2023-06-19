import { OrganizationId } from '@dogu-private/types';
import { PageDtoBase } from '../pagination/page.dto';

export interface CreateAdminDtoBase {
  email: string;
  name: string;
  password: string;
  newsletter: boolean;
  invitationToken?: string;
  invitationOrganizationId?: OrganizationId;
}

export interface CreateInvitationMemberDtoBase {
  organizationId: OrganizationId;
  token: string;
  email: string;
  newsletter: boolean;
  name?: string;
  password?: string;
}

export interface FindUsersByOrganizationIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface FindUsersByTeamIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface FindProjectsByTeamIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface ResetPasswordDtoBase {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SignInDtoBase {
  email: string;
  password: string;
  invitationToken?: string;
  invitationOrganizationId?: OrganizationId;
}

export interface InvitationSignInDtoBase extends SignInDtoBase {
  token: string;
  organizationId: OrganizationId;
}

export interface UpdateUserDtoBase {
  name?: string;
  profileImageUrl?: string;
}

export interface UpdateLastOrganizationDtoBase {
  organizationId: OrganizationId;
}
