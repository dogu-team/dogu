import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface BillingInfoAndBillingPromotionBase {
  billingInfoId: string;
  billingPromotionId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingInfoAndBillingPromotionPropCamel = propertiesOf<BillingInfoAndBillingPromotionBase>();
export const BillingInfoAndBillingPromotionPropSnake = camelToSnakeCasePropertiesOf<BillingInfoAndBillingPromotionBase>();
