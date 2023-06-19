import { OrganizationId, OrganizationRoleId, TokenId, UserId, USER_INVITATION_STATUS } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

import { OrganizationBase } from './organization';
import { OrganizationRoleBase } from './organization-role';
import { TokenBase } from './token';

export interface UserAndInvitationTokenRelationTraits {
  token?: TokenBase;
  organization?: OrganizationBase;
  organizationRole?: OrganizationRoleBase;
}

export interface UserAndInvitationTokenBaseTraits {
  // userInvitationId: UserInvitationId;
  email: string;
  organizationId: OrganizationId;
  organizationRoleId: OrganizationRoleId;
  tokenId: TokenId;
  status: USER_INVITATION_STATUS;
  inviterId: UserId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type UserAndInvitationTokenBase = UserAndInvitationTokenBaseTraits & UserAndInvitationTokenRelationTraits;
export const UserAndInvitationTokenPropCamel = propertiesOf<UserAndInvitationTokenBase>();
export const UserAndInvitationTokenPropSnake = camelToSnakeCasePropertiesOf<UserAndInvitationTokenBase>();
