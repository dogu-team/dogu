import { OrganizationApiTokenId, OrganizationId, TokenId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { OrganizationBase } from './organization';
import { TokenBase } from './token';
import { UserBase } from './user';

export interface OrganizationApiTokenRelationTraits {
  creator?: UserBase;
  revoker?: UserBase;
  organization?: OrganizationBase;
  token?: TokenBase;
}

export interface OrganizationApiTokenBaseTraits {
  organizationApiTokenId: OrganizationApiTokenId;
  organizationId: OrganizationId;
  tokenId: TokenId;
  creatorId: UserId | null;
  revokerId: UserId | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type OrganizationApiTokenBase = OrganizationApiTokenBaseTraits & OrganizationApiTokenRelationTraits;
export const OrganizationApiTokenPropCamel = propertiesOf<OrganizationApiTokenBase>();
export const OrganizationApiTokenPropSnake = camelToSnakeCasePropertiesOf<OrganizationApiTokenBase>();
