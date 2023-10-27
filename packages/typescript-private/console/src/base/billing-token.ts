import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface BillingTokenBase {
  billingTokenId: string;
  token: string;
  createdAt: Date;
  expiredAt: Date | null;
  deletedAt: Date | null;
}
export const BillingTokenPropCamel = propertiesOf<BillingTokenBase>();
export const BillingTokenPropSnake = camelToSnakeCasePropertiesOf<BillingTokenBase>();
