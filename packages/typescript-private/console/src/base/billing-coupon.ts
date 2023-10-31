import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface BillingCouponBase {
  billingCouponId: string;
  code: string;

  /**
   * @example 10 10% discount
   */
  discountPercent: number;
  remainingCount: number | null;
  expiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingCouponPropCamel = propertiesOf<BillingCouponBase>();
export const BillingCouponPropSnake = camelToSnakeCasePropertiesOf<BillingCouponBase>();
