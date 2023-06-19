import { SNS_TYPE, UserId, UserSnsId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { UserBase } from './user';

export interface UserSnsRelationTraits {
  user?: UserBase;
}

export interface UserSnsBaseTraits {
  userSnsId: UserSnsId;
  userId: UserId;
  snsType: SNS_TYPE;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type UserSnsBase = UserSnsBaseTraits & UserSnsRelationTraits;
export const UserSnsBasePropCamel = propertiesOf<UserSnsBase>();
export const UserSnsBasePropSnake = camelToSnakeCasePropertiesOf<UserSnsBase>();
