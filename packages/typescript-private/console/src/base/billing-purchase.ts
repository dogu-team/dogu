import { IsFilledString } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { buildMessage, IsIn, IsNumber, IsOptional, IsString, IsUUID, Length, ValidateBy, ValidateNested } from 'class-validator';
import { BillingResultCode, BillingSubscriptionPlanSourceData } from '..';
import { BillingCategory, BillingCurrency, BillingPeriod, BillingSubscriptionPlanType } from './billing';
import { BillingCouponBase } from './billing-coupon';

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

export class BillingSubscriptionPlanPreviewDto {
  @IsIn(BillingCategory)
  category!: BillingCategory;

  @IsIn(BillingSubscriptionPlanType)
  type!: BillingSubscriptionPlanType;

  @IsNumber()
  @Type(() => Number)
  option!: number;

  @IsIn(BillingCurrency)
  currency!: BillingCurrency;

  @IsIn(BillingPeriod)
  period!: BillingPeriod;

  @IsString()
  @IsOptional()
  couponCode?: string;
}

export class GetBillingSubscriptionPreviewDto extends BillingSubscriptionPlanPreviewDto {
  @IsUUID()
  organizationId!: string;
}

export interface RemainingPlan {
  billingSubscriptionPlanId: string;
  category: BillingCategory;
  type: BillingSubscriptionPlanType;
  option: number;
  period: BillingPeriod;
  currency: BillingCurrency;
  amount: number;
  nextPurchaseAt: Date;
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

export interface CouponPreviewResponse extends BillingCouponBase {
  discountAmount: number;
}

export interface GetBillingSubscriptionPreviewResponseFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface GetBillingSubscriptionPreviewResponseSuccess {
  ok: true;
  resultCode: BillingResultCode;
  totalPrice: number;
  nextPurchaseTotalPrice: number;
  nextPurchaseAt: Date;
  tax: number;
  subscriptionPlan: BillingSubscriptionPlanSourceData;
  coupon: CouponPreviewResponse | null;
  elapsedPlans: ElapsedPlan[];
  remainingPlans: RemainingPlan[];
}

export type GetBillingSubscriptionPreviewResponse = GetBillingSubscriptionPreviewResponseFailure | GetBillingSubscriptionPreviewResponseSuccess;

export class CreatePurchaseSubscriptionDto extends GetBillingSubscriptionPreviewDto {}

export interface CreatePurchaseSubscriptionResponse {
  ok: boolean;
  resultCode: BillingResultCode;
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

export interface CreatePurchaseSubscriptionWithNewCardResponse {
  ok: boolean;
  resultCode: BillingResultCode;
}
