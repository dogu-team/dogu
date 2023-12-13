import { IsFilledString } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { buildMessage, IsIn, IsNumber, IsOptional, IsString, IsUUID, Length, ValidateBy, ValidateNested } from 'class-validator';

import { BillingCategory, BillingCurrency, BillingMethod, BillingPeriod, BillingPlanData, BillingPlanType } from './billing';
import { BillingResultCode } from './billing-code';
import { BillingCouponBase } from './billing-coupon';
import { BillingMethodNicePublic } from './billing-method-nice';
import { BillingPlanInfoResponse } from './billing-plan-info';
import { CloudLicenseBase } from './cloud-license';

export interface BillingPreprocessOptions {
  organizationId: string;
  billingPlanSourceId: number;
  couponCode?: string;
}

export class GetBillingPreviewDto implements BillingPreprocessOptions {
  @IsUUID()
  organizationId!: string;

  @IsNumber()
  @Type(() => Number)
  billingPlanSourceId!: number;

  @IsIn(BillingMethod)
  method!: BillingMethod;

  @IsString()
  @IsOptional()
  couponCode?: string;
}

export interface RemainingPlan {
  category: BillingCategory;
  type: BillingPlanType;
  option: number;
  period: BillingPeriod;
  currency: BillingCurrency;
  remainingDiscountedAmount: number;
  remainingDays: number;
}

export interface ElapsedPlan {
  category: BillingCategory;
  type: BillingPlanType;
  option: number;
  period: BillingPeriod;
  currency: BillingCurrency;
  elapsedDiscountedAmount: number;
  elapsedDays: number;
}

export type PaddleElapsePlan = {
  category: BillingCategory;
  type: BillingPlanType;
  option: number;
  period: BillingPeriod;
  currency: BillingCurrency;
  elapsedPurchaseAmount: number;
  elapsedMinutesRate: number;
};

export interface CouponPreviewResponse extends BillingCouponBase {
  discountedAmount: number;
}

export interface GetBillingPreviewResponseFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface GetBillingPreviewResponseSuccess {
  ok: true;
  resultCode: BillingResultCode;
  totalPrice: number;
  nextPurchaseTotalPrice: number;
  nextPurchasedAt: Date;
  tax: number;
  coupon: CouponPreviewResponse | null;
  plan: BillingPlanData;
  elapsedPlans: ElapsedPlan[];
  remainingPlans: RemainingPlan[];
  paddleElapsePlans: PaddleElapsePlan[];
}

export type GetBillingPreviewResponse = GetBillingPreviewResponseFailure | GetBillingPreviewResponseSuccess;

export class CreatePurchaseDto extends GetBillingPreviewDto {}

export interface CreatePurchaseResponse {
  ok: boolean;
  resultCode: BillingResultCode;
  plan: BillingPlanInfoResponse | null;
  license: CloudLicenseBase | null;
  niceResultCode: string | null;
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

export class CreatePurchaseWithNewCardDto extends CreatePurchaseDto {
  @ValidateNested()
  @Type(() => RegisterCardDto)
  registerCard!: RegisterCardDto;
}

export interface CreatePurchaseWithNewCardResponse {
  ok: boolean;
  resultCode: BillingResultCode;
  plan: BillingPlanInfoResponse | null;
  method: BillingMethodNicePublic | null;
  license: CloudLicenseBase | null;
  niceResultCode: string | null;
}

export class RefundPlanDto {
  @IsUUID()
  billingPlanHistoryId!: string;

  @IsIn(BillingMethod)
  method!: BillingMethod;
}

export class RefundFullDto {
  @IsUUID()
  billingHistoryId!: string;

  @IsIn(BillingMethod)
  method!: BillingMethod;
}

export class GetBillingPrecheckoutDto implements BillingPreprocessOptions {
  @IsUUID()
  organizationId!: string;

  @IsNumber()
  @Type(() => Number)
  billingPlanSourceId!: number;

  @IsString()
  @IsOptional()
  couponCode?: string;
}

export const BillingPrecheckoutType = ['new', 'upgrade', 'downgrade'] as const;
export type BillingPrecheckoutType = (typeof BillingPrecheckoutType)[number];

export interface GetBillingPrecheckoutResponse {
  paddle: {
    customerId: string;
    priceId: string;
    discountId: string | null;
    addressId: string | null;
    businessId: string | null;
  };
}
