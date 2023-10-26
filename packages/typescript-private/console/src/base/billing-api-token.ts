import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface BillingApiTokenBase {
  billingApiTokenId: string;
  token: string;
  createdAt: Date;
  expiredAt: Date | null;
  deletedAt: Date | null;
}
export const BillingApiTokenPropCamel = propertiesOf<BillingApiTokenBase>();
export const BillingApiTokenPropSnake = camelToSnakeCasePropertiesOf<BillingApiTokenBase>();
