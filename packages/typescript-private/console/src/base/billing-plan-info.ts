import { propertiesOf } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { BillingPeriod, BillingPlanData } from './billing';
import { BillingCouponBase } from './billing-coupon';
import { BillingOrganizationBase } from './billing-organization';
import { BillingPlanSourceBase } from './billing-plan-source';

export const BillingPlanState = ['subscribed', 'unsubscribed', 'unsubscribe-requested', 'change-option-or-period-requested'] as const;
export type BillingPlanState = (typeof BillingPlanState)[number];

export interface BillingPlanInfoBase extends BillingPlanData {
  billingPlanInfoId: string;
  billingOrganizationId: string;
  billingCouponId: string | null;
  discountedAmount: number;
  billingPlanSourceId: number;
  changeRequestedPeriod: BillingPeriod | null;
  changeRequestedOption: number | null;
  changeRequestedOriginPrice: number | null;
  changeRequestedDiscountedAmount: number | null;
  unsubscribedAt: Date | null;
  state: BillingPlanState;
  billingPlanHistoryId: string | null;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
  billingCoupon?: BillingCouponBase;
  billingPlanSource?: BillingPlanSourceBase;

  // nice only
  /**
   * @description null means unlimited
   */
  couponRemainingApplyCount: number | null;
  couponApplied: boolean;

  // paddle only
  paddleMethodType: string | null;
  cardCode: string | null;
  cardName: string | null;
  cardNumberLast4Digits: string | null;
  cardExpirationYear: string | null;
  cardExpirationMonth: string | null;
}

export const BillingPlanInfoProp = propertiesOf<BillingPlanInfoBase>();

export class UpdateBillingPlanInfoDto {
  @IsIn(BillingPeriod)
  @IsOptional()
  changeRequestedPeriod?: BillingPeriod;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  changeRequestedOption?: number;
}

export interface BillingPlanInfoResponse extends BillingPlanInfoBase {
  expiredAt: Date | null;
}

export class UpdateBillingPlanInfoStateDto {
  @IsUUID()
  organizationId!: string;
}

export interface GetUpdatePaymentMethodTransactionResponse {
  paddle: {
    customerId: string;
    transactionId: string;
  };
}
