import { IsFilledString } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { buildMessage, IsIn, IsNumber, IsOptional, IsString, IsUUID, Length, ValidateBy, ValidateNested } from 'class-validator';
import { BillingSubscriptionPlanSourceData } from '..';
import { BillingCategory, BillingCurrency, BillingPeriod, BillingSubscriptionPlanType } from './billing';
import { BillingCouponBase, BillingCouponReason } from './billing-coupon';

/**
 * @description
 * subscription plan = { type * option * currency * period }
 * case 1 - subscription plan not found and subscribe plan
 * case 2 - subscription plan found and subscribe other plan
 * case 3 - upgrade subscription plan option
 * case 4 - upgrade subscription plan period
 * case 5 - upgrade subscription plan option and period
 * case 6 - downgrade subscription plan option
 * case 7 - downgrade subscription plan period
 * case 8 - downgrade subscription plan option and period
 * case 9 - unsubscribe plan and remaining plan found
 * case 10 - unsubscribe plan and remaining plan not found
 *
 * case 100 - organization not found
 * case 101 - category not matched
 * case 102 - currency not matched
 * case 103 - subscription plan not found
 * case 104 - subscription plan type not found
 * case 105 - subscription plan option not found
 * case 106 - subscription plan source not found
 * case 107 - currency not found
 * case 108 - period not found
 * case 109 - coupon not found
 * case 110 - coupon expired
 * case 111 - coupon already used
 * case 112 - duplicated subscription plan
 */

export const BillingSubscriptionPreviewReason = [
  ...BillingCouponReason,
  'available',
  'currency-not-found',
  'period-not-found',
  'subscription-plan-type-not-found',
  'subscription-plan-option-not-found',
  'first-purchased-at-not-found',
  'category-not-matched',
  'currency-not-matched',
  'duplicated-subscription-plan',
] as const;
export type BillingSubscriptionPreviewReason = (typeof BillingSubscriptionPreviewReason)[number];

export class GetBillingSubscriptionPreviewDto {
  @IsUUID()
  organizationId!: string;

  @IsIn(BillingCategory)
  category!: BillingCategory;

  @IsIn(BillingSubscriptionPlanType)
  subscriptionPlanType!: BillingSubscriptionPlanType;

  @IsNumber()
  @Type(() => Number)
  subscriptionPlanOption!: number;

  @IsIn(BillingCurrency)
  currency!: BillingCurrency;

  @IsIn(BillingPeriod)
  period!: BillingPeriod;

  @IsString()
  @IsOptional()
  couponCode?: string;
}

export interface RemainingPlan {
  billingSubscriptionPlanId: string;
  category: BillingCategory;
  type: BillingSubscriptionPlanType;
  option: number;
  period: BillingPeriod;
  currency: BillingCurrency;
  amount: number;
  nextPurchasedAt: Date;
}

export interface ElapsedPlan {
  category: BillingCategory;
  type: BillingSubscriptionPlanType;
  option: number;
  period: BillingPeriod;
  currency: BillingCurrency;
  amount: number;
  lastPurchasedAt: Date;
}

export interface GetBillingSubscriptionPreviewResponseFailure {
  ok: false;
  reason: BillingSubscriptionPreviewReason;
}

export interface GetBillingSubscriptionPreviewResponseSuccess {
  ok: true;
  reason: BillingSubscriptionPreviewReason;
  totalPrice: number;
  nextPurchaseTotalPrice: number;
  nextPurchaseAt: Date;
  tax: number;
  subscriptionPlan: BillingSubscriptionPlanSourceData;
  coupon: BillingCouponBase | null;
  elapsedPlans: ElapsedPlan[];
  remainingPlans: RemainingPlan[];
}

export type GetBillingSubscriptionPreviewResponse = GetBillingSubscriptionPreviewResponseFailure | GetBillingSubscriptionPreviewResponseSuccess;

export class CreatePurchaseSubscriptionDto extends GetBillingSubscriptionPreviewDto {}

export const BillingSubscriptionPurchaseReason = [...BillingSubscriptionPreviewReason, 'purchased'] as const;
export type BillingSubscriptionPurchaseReason = (typeof BillingSubscriptionPurchaseReason)[number];

export interface CreatePurchaseSubscriptionResponse {
  ok: boolean;
  reason: BillingSubscriptionPurchaseReason;
}

export class RegisterCardDto {
  @IsFilledString()
  @Length(16, 16)
  cardNumber!: string;

  @IsFilledString()
  @Length(2, 2)
  expirationYear!: string;

  @IsFilledString()
  @Length(2, 2)
  expirationMonth!: string;

  @IsFilledString()
  @ValidateBy({
    name: 'isIdNumber',
    constraints: [],
    validator: {
      validate: (value: unknown) => {
        if (typeof value !== 'string') {
          return false;
        }
        return value.length === 6 || value.length === 10;
      },
      defaultMessage: buildMessage((eachPrefix) => eachPrefix + '$property must be 6 or 10 digits'),
    },
  })
  idNumber!: string;

  @IsFilledString()
  @Length(2, 2)
  cardPasswordFirst2Digits!: string;
}

export class CreatePurchaseSubscriptionWithNewCardDto extends CreatePurchaseSubscriptionDto {
  @ValidateNested()
  @Type(() => RegisterCardDto)
  registerCard!: RegisterCardDto;
}

export const BillingSubscriptionPurchaseWithNewCardReason = [...BillingSubscriptionPurchaseReason, 'invalid-card'] as const;
export type BillingSubscriptionPurchaseWithNewCardReason = (typeof BillingSubscriptionPurchaseWithNewCardReason)[number];

export interface CreatePurchaseSubscriptionWithNewCardResponse {
  ok: boolean;
  reason: BillingSubscriptionPurchaseWithNewCardReason;
}
