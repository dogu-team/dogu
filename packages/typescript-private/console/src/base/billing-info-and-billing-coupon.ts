import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface BillingInfoAndBillingCouponBase {
  billingInfoId: string;
  billingCouponId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingInfoAndBillingCouponPropCamel = propertiesOf<BillingInfoAndBillingCouponBase>();
export const BillingInfoAndBillingCouponPropSnake = camelToSnakeCasePropertiesOf<BillingInfoAndBillingCouponBase>();
