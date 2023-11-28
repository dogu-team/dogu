import { IsFilledString, propertiesOf } from '@dogu-tech/common';
import { IsIn, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { BillingCategory } from '..';

import { BillingPeriod, BillingPlanType } from './billing';
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
  planType: BillingPlanType | null;

  period: BillingPeriod;

  /**
   * @example 10 10% discount
   */
  discountPercent: number;

  /**
   * @description null unlimited apply
   */
  applyCount: number | null;

  /**
   * @description null unlimited available count
   */
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

  @IsIn(BillingPlanType)
  @IsOptional()
  planType?: BillingPlanType;
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

  @IsIn(BillingCategory)
  category!: BillingCategory;

  @IsOptional()
  @IsIn(BillingPlanType)
  planType?: BillingPlanType;
}

export class CreateBillingCouponDto {
  @IsFilledString()
  code!: string;

  @IsIn(BillingCouponType)
  type!: BillingCouponType;

  @IsOptional()
  @IsIn(BillingPlanType)
  planType?: BillingPlanType;

  @IsIn(BillingPeriod)
  period!: BillingPeriod;

  @IsNumber()
  discountPercent!: number;

  @IsNumber()
  @IsOptional()
  applyCount?: number;

  @IsNumber()
  @IsOptional()
  remainingAvailableCount?: number;
}

export type BillingPromotionCouponResponse = Pick<BillingCouponBase, 'code' | 'type' | 'period' | 'applyCount' | 'discountPercent' | 'planType' | 'createdAt' | 'expiredAt'>;
