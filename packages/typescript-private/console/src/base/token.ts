import { TokenId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface TokenBaseTraits {
  tokenId: TokenId;
  token: string;
  createdAt: Date;
  expiredAt: Date | null;
  deletedAt: Date | null;
}

export type TokenBase = TokenBaseTraits;
export const TokenPropCamel = propertiesOf<TokenBase>();
export const TokenPropSnake = camelToSnakeCasePropertiesOf<TokenBase>();
