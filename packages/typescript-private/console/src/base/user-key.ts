import { UserId, UserKeyId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { UserBase } from './user';

interface UserKeyRelationTraits {
  user?: UserBase;
}

export interface UserKeyBaseTraits {
  userKeyId: UserKeyId;
  userId: UserId;
  key: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type UserKeyBase = UserKeyBaseTraits & UserKeyRelationTraits;
export const UserKeyPropCamel = propertiesOf<UserKeyBase>();
export const UserKeyPropSnake = camelToSnakeCasePropertiesOf<UserKeyBase>();
