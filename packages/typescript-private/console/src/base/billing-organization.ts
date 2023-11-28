import { propertiesOf } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsIn, IsUUID, ValidateNested } from 'class-validator';
import { BillingMethodPaddleBase } from '..';
import { BillingCategory, BillingCurrency, BillingMethod } from './billing';
import { BillingMethodNiceBase } from './billing-method-nice';
import { BillingPlanInfoBase, BillingPlanInfoResponse } from './billing-plan-info';
import { BillingPlanSourceBase } from './billing-plan-source';
import { RegisterCardDto } from './billing-purchase';

export interface BillingOrganizationBase {
  billingOrganizationId: string;
  organizationId: string;
  category: BillingCategory;
  currency: BillingCurrency | null;
  subscriptionYearlyStartedAt: Date | null;
  subscriptionYearlyExpiredAt: Date | null;
  subscriptionMonthlyStartedAt: Date | null;
  subscriptionMonthlyExpiredAt: Date | null;
  graceExpiredAt: Date | null;
  graceNextPurchasedAt: Date | null;
  billingMethod: BillingMethod | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingPlanInfos?: BillingPlanInfoBase[];
  billingPlanSources?: BillingPlanSourceBase[];
  billingMethodNice?: BillingMethodNiceBase;
  billingMethodPaddle?: BillingMethodPaddleBase;
}

export const BillingOrganizationProp = propertiesOf<BillingOrganizationBase>();

export class FindBillingOrganizationDto {
  @IsUUID()
  organizationId!: string;
}

export class CreateBillingOrganizationDto {
  @IsUUID()
  organizationId!: string;

  @IsIn(BillingCategory)
  category!: BillingCategory;
}

export class CreateOrUpdateBillingOrganizationWithNiceDto {
  @IsUUID()
  organizationId!: string;

  @IsIn(BillingCategory)
  category!: BillingCategory;

  @ValidateNested()
  @Type(() => RegisterCardDto)
  registerCard!: RegisterCardDto;
}

export interface BillingOrganizationResponse extends BillingOrganizationBase {
  billingPlanInfos: BillingPlanInfoResponse[];
}
