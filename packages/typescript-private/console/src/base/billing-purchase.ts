import { IsFilledString } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { buildMessage, IsIn, IsNumber, IsOptional, IsString, IsUUID, Length, ValidateBy, ValidateNested } from 'class-validator';
import { BillingCategory, BillingCurrency, BillingPeriod, BillingSubscriptionPlanData, BillingSubscriptionPlanType } from './billing';
import { BillingResultCode } from './billing-code';
import { BillingCouponBase } from './billing-coupon';

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
  coupon: CouponPreviewResponse | null;
  subscriptionPlan: BillingSubscriptionPlanData;
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
