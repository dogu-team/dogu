import { TokenId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { TokenBase } from './token';
import { UserBase } from './user';

export interface UserAndRefreshTokenRelationTraits {
  token?: TokenBase;
  user?: UserBase;
}

export interface UserAndRefreshTokenBaseTraits {
  tokenId: TokenId;
  userId: UserId;
  createdAt: Date;
  deletedAt: Date | null;
}

export type UserAndRefreshTokenBase = UserAndRefreshTokenBaseTraits;
export const UserAndRefreshTokenPropCamel = propertiesOf<UserAndRefreshTokenBase>();
export const UserAndRefreshTokenPropSnake = camelToSnakeCasePropertiesOf<UserAndRefreshTokenBase>();
