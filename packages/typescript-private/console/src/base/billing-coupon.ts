import { camelToSnakeCasePropertiesOf, IsFilledString, propertiesOf } from '@dogu-tech/common';
import { IsUUID } from 'class-validator';

export const BillingCouponType = ['basic', 'promotion'] as const;
export type BillingCouponType = (typeof BillingCouponType)[number];

export interface BillingCouponBase {
  billingCouponId: string;
  code: string;
  type: BillingCouponType;

  /**
   * @example 10 10% discount
   */
  monthlyDiscountPercent: number | null;
  monthlyApplyCount: number | null;
  yearlyDiscountPercent: number | null;
  yearlyApplyCount: number | null;
  remainingAvailableCount: number | null;
  expiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingCouponPropCamel = propertiesOf<BillingCouponBase>();
export const BillingCouponPropSnake = camelToSnakeCasePropertiesOf<BillingCouponBase>();

export class ValidateBillingCouponDto {
  @IsUUID()
  organizationId!: string;

  @IsFilledString()
  billingCouponCode!: string;
}

export interface ValidateBillingCouponResponse {
  ok: boolean;
  reason: 'already-used' | 'expired' | 'coupon-not-found' | 'organization-not-found' | 'not-used';
}

export class GetAvailableBillingCouponsDto {
  @IsUUID()
  organizationId!: string;
}
