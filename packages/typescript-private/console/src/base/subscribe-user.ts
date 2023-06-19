import { SubscribeUserId, SUBSCRIBE_USER_STATUS, TokenId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { TokenBase } from './token';

export interface SubscribeUserRelationTraits {
  token?: TokenBase;
}

export interface SubscribeUserBaseTraits {
  subscribeUserId: SubscribeUserId;
  tokenId: TokenId;
  email: string;
  status: SUBSCRIBE_USER_STATUS;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type SubscribeUserBase = SubscribeUserBaseTraits & SubscribeUserRelationTraits;
export const SubscribeUserPropCamel = propertiesOf<SubscribeUserBase>();
export const SubscribeUserPropSnake = camelToSnakeCasePropertiesOf<SubscribeUserBase>();
