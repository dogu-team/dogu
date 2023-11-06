import { IsFilledString, propertiesOf } from '@dogu-tech/common';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

import { BillingPeriod } from './billing';
import { BillingResultCode } from './billing-code';

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

  /**
   * @description null unlimited apply
   */
  monthlyApplyCount: number | null;

  /**
   * @example 10 10% discount
   */
  yearlyDiscountPercent: number | null;

  /**
   * @description null unlimited apply
   */
  yearlyApplyCount: number | null;
  remainingAvailableCount: number | null;

  /**
   * @description null unlimited expiration
   */
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

  @IsIn(BillingPeriod)
  period!: BillingPeriod;
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

export class CreateBillingCouponDto {
  @IsFilledString()
  code!: string;

  @IsIn(BillingCouponType)
  type!: BillingCouponType;

  @IsOptional()
  @IsNumber()
  monthlyDiscountPercent?: number;

  @IsOptional()
  @IsNumber()
  monthlyApplyCount?: number;

  @IsOptional()
  @IsNumber()
  yearlyDiscountPercent?: number;

  @IsOptional()
  @IsNumber()
  yearlyApplyCount?: number;

  @IsNotEmpty()
  @IsNumber()
  remainingAvailableCount!: number;
}
