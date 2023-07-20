import { OrganizationAccessTokenId, OrganizationId, TokenId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { OrganizationBase } from './organization';
import { TokenBase } from './token';
import { UserBase } from './user';

export interface OrganizationAccessTokenRelationTraits {
  creator?: UserBase;
  revoker?: UserBase;
  organization?: OrganizationBase;
  token?: TokenBase;
}

export interface OrganizationAccessTokenBaseTraits {
  organizationAccessTokenId: OrganizationAccessTokenId;
  organizationId: OrganizationId;
  tokenId: TokenId;
  creatorId: UserId | null;
  revokerId: UserId | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type OrganizationAccessTokenBase = OrganizationAccessTokenBaseTraits & OrganizationAccessTokenRelationTraits;
export const OrganizationApiTokenPropCamel = propertiesOf<OrganizationAccessTokenBase>();
export const OrganizationApiTokenPropSnake = camelToSnakeCasePropertiesOf<OrganizationAccessTokenBase>();
