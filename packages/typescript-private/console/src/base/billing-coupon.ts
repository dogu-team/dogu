import { IsFilledString, propertiesOf } from '@dogu-tech/common';
import { IsUUID } from 'class-validator';
import { BillingResultCode } from '..';

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

export const BillingCouponProp = propertiesOf<BillingCouponBase>();

export class ValidateBillingCouponDto {
  @IsUUID()
  organizationId!: string;

  @IsFilledString()
  code!: string;
}

export interface ValidateBillingCouponResponse {
  ok: boolean;
  resultCode: BillingResultCode;
  coupon: BillingCouponBase | null;
}

export class GetAvailableBillingCouponsDto {
  @IsUUID()
  organizationId!: string;

  @IsFilledString()
  type!: BillingCouponType;
}
