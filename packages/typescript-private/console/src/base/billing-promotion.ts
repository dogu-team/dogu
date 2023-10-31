import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface BillingPromotionBase {
  billingPromitionId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingPromotionPropCamel = propertiesOf<BillingPromotionBase>();
export const BillingPromotionPropSnake = camelToSnakeCasePropertiesOf<BillingPromotionBase>();
