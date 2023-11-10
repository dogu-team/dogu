import { IsFilledString, propertiesOf } from '@dogu-tech/common';
import { IsIn, IsNumber, IsOptional, IsUUID } from 'class-validator';

import { BillingPeriod, BillingSubscriptionPlanType } from './billing';
import { BillingResultCode } from './billing-code';

export const BillingCouponType = ['basic', 'promotion'] as const;
export type BillingCouponType = (typeof BillingCouponType)[number];

export interface BillingCouponBase {
  billingCouponId: string;
  code: string;
  type: BillingCouponType;

  /**
   * @description Available only for certain subscription plan type. If null, it is available for all subscription plan types.
   */
  subscriptionPlanType: BillingSubscriptionPlanType | null;

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

  @IsIn(BillingSubscriptionPlanType)
  @IsOptional()
  subscriptionPlanType?: BillingSubscriptionPlanType;
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
  @IsIn(BillingSubscriptionPlanType)
  subscriptionPlanType?: BillingSubscriptionPlanType;

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

  @IsOptional()
  @IsNumber()
  remainingAvailableCount!: number;
}
