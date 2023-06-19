import { OrganizationId, UserId } from '@dogu-private/types';

export interface RegisterySignResult {
  accessToken: string;
  refreshToken: string;
  userId: UserId;
}

export interface LastAccessOrganizationResponse {
  lastAccessOrganizationId: OrganizationId;
  userId: UserId;
}

export interface InvitationSignUpResponse extends RegisterySignResult {
  organizationId: OrganizationId;
}
