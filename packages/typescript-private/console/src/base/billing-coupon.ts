import { IsFilledString, propertiesOf } from '@dogu-tech/common';
import { IsUUID } from 'class-validator';

export const BillingCouponType = ['basic', 'promotion'] as const;
export type BillingCouponType = (typeof BillingCouponType)[number];

export const BillingCouponReason = [
  'coupon-not-found',
  'coupon-expired',
  'organization-not-found',
  'coupon-already-used',
  'coupon-not-used',
  'coupon-all-used',
  'coupon-invalid-monthly-apply-count',
  'coupon-invalid-yearly-apply-count',
  'coupon-null-argument',
  'coupon-invalid-monthly-discount-percent',
  'coupon-invalid-yearly-discount-percent',
] as const;
export type BillingCouponReason = (typeof BillingCouponReason)[number];

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

export const BillingCouponProp = propertiesOf<BillingCouponBase>();

export class ValidateBillingCouponDto {
  @IsUUID()
  organizationId!: string;

  @IsFilledString()
  code!: string;
}

export interface ValidateBillingCouponResponse {
  ok: boolean;
  reason: BillingCouponReason;
  coupon: BillingCouponBase | null;
}

export class GetAvailableBillingCouponsDto {
  @IsUUID()
  organizationId!: string;

  @IsFilledString()
  type!: BillingCouponType;
}
