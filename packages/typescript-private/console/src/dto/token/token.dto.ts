import { OrganizationId } from '@dogu-private/types';

export enum TokenType {
  VERIFY = 'verify',
  RESET = 'reset',
  INVITE = 'invite',
  UNSUBSCRIBE = 'unsubscribe',
}

export interface CreateTokenDtoBase {
  expiredAt?: Date;
  type: TokenType;
  email: string;
  organizationId: OrganizationId | null;
}
