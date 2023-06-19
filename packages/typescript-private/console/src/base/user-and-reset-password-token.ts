import { TokenId, UserId, USER_RESET_PASSWORD_STATUS } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { TokenBase } from './token';

export interface UserAndResetPasswordTokenRelationTraits {
  token?: TokenBase;
}

export interface UserAndResetPasswordTokenBaseTraits {
  userId: UserId;
  tokenId: TokenId;
  status: USER_RESET_PASSWORD_STATUS;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type UserAndResetPasswordTokenBase = UserAndResetPasswordTokenBaseTraits & UserAndResetPasswordTokenRelationTraits;
export const UserAndResetPasswordTokenPropCamel = propertiesOf<UserAndResetPasswordTokenBase>();
export const UserAndResetPasswordTokenPropSnake = camelToSnakeCasePropertiesOf<UserAndResetPasswordTokenBase>();
