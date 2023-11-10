import { propertiesOf } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { BillingPeriod, BillingSubscriptionPlanData } from './billing';
import { BillingCouponBase } from './billing-coupon';
import { BillingOrganizationBase } from './billing-organization';
import { BillingSubscriptionPlanSourceBase } from './billing-subscription-plan-source';

export const BillingSubscriptionPlanState = ['subscribed', 'unsubscribed', 'unsubscribe-requested', 'change-option-or-period-requested'] as const;
export type BillingSubscriptionPlanState = (typeof BillingSubscriptionPlanState)[number];

export interface BillingSubscriptionPlanInfoBase extends BillingSubscriptionPlanData {
  billingSubscriptionPlanInfoId: string;
  billingOrganizationId: string;
  billingCouponId: string | null;

  /**
   * @description null means unlimited
   */
  couponRemainingApplyCount: number | null;
  couponApplied: boolean;
  discountedAmount: number;
  billingSubscriptionPlanSourceId: string | null;
  changeRequestedPeriod: BillingPeriod | null;
  changeRequestedOption: number | null;
  changeRequestedOriginPrice: number | null;
  changeRequestedDiscountedAmount: number | null;
  unsubscribedAt: Date | null;
  state: BillingSubscriptionPlanState;
  billingSubscriptionPlanHistoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
  billingCoupon?: BillingCouponBase;
  billingSubscriptionPlanSource?: BillingSubscriptionPlanSourceBase;
}

export const BillingSubscriptionPlanInfoProp = propertiesOf<BillingSubscriptionPlanInfoBase>();

export class UpdateBillingSubscriptionPlanInfoDto {
  @IsIn(BillingPeriod)
  @IsOptional()
  changeRequestedPeriod?: BillingPeriod;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  changeRequestedOption?: number;
}

export interface BillingSubscriptionPlanInfoResponse extends BillingSubscriptionPlanInfoBase {
  yearlyExpiredAt: Date | null;
  monthlyExpiredAt: Date | null;
}

export class UpdateBillingSubscriptionPlanInfoStateDto {
  @IsUUID()
  organizationId!: string;
}
