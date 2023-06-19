import { TokenId, UserId, USER_VERIFICATION_STATUS } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { TokenBase } from './token';
import { UserBase } from './user';

export interface UserAndVerificationTokenRelationTraits {
  token?: TokenBase;
  user?: UserBase;
}

export interface UserAndVerificationTokenBaseTraits {
  userId: UserId;
  tokenId: TokenId | null;
  status: USER_VERIFICATION_STATUS;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type UserAndVerificationTokenBase = UserAndVerificationTokenBaseTraits & UserAndVerificationTokenRelationTraits;
export const UserAndVerificationTokenPropCamel = propertiesOf<UserAndVerificationTokenBase>();
export const UserAndVerificationTokenPropSnake = camelToSnakeCasePropertiesOf<UserAndVerificationTokenBase>();
