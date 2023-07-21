import { PersonalAccessTokenId, TokenId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { TokenBase } from './token';
import { UserBase } from './user';

export interface PersonalAccessTokenRelationTraits {
  user?: UserBase;
  token?: TokenBase;
}

export interface PersonalAccessTokenBaseTraits {
  personalAccessTokenId: PersonalAccessTokenId;
  userId: UserId;
  tokenId: TokenId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type PersonalAccessTokenBase = PersonalAccessTokenBaseTraits & PersonalAccessTokenRelationTraits;
export const PersonalAccessTokenPropCamel = propertiesOf<PersonalAccessTokenBase>();
export const PersonalAccessTokenPropSnake = camelToSnakeCasePropertiesOf<PersonalAccessTokenBase>();
