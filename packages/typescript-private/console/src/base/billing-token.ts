import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface BillingTokenBase {
  billingTokenId: string;
  token: string;
  expiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingTokenPropCamel = propertiesOf<BillingTokenBase>();
export const BillingTokenPropSnake = camelToSnakeCasePropertiesOf<BillingTokenBase>();
