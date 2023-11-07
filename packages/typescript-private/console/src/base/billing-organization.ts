import { propertiesOf } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsIn, IsUUID, ValidateNested } from 'class-validator';
import { BillingCategory, BillingCurrency } from './billing';
import { BillingMethodNiceBase } from './billing-method-nice';
import { RegisterCardDto } from './billing-purchase';
import { BillingSubscriptionPlanInfoBase, BillingSubscriptionPlanInfoForCloudLicenseResponse } from './billing-subscription-plan-info';
import { BillingSubscriptionPlanSourceBase } from './billing-subscription-plan-source';

export interface BillingOrganizationBase {
  billingOrganizationId: string;
  organizationId: string;
  category: BillingCategory;
  currency: BillingCurrency | null;

  /**
   * @description this value is used for yearly purchase days calculation.
   */
  yearlyStartedAt: Date | null;

  /**
   * @description this value is used for yearly purchase days calculation.
   */
  yearlyExpiredAt: Date | null;

  /**
   * @description this value is used for monthly purchase days calculation.
   */
  monthlyStartedAt: Date | null;

  /**
   * @description this value is used for monthly purchase days calculation.
   */
  monthlyExpiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingSubscriptionPlanInfos?: BillingSubscriptionPlanInfoBase[];
  billingSubscriptionPlanSources?: BillingSubscriptionPlanSourceBase[];
  billingMethodNice?: BillingMethodNiceBase;
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

export interface BillingOrganizationForCloudLicenseResponse extends BillingOrganizationBase {
  billingSubscriptionPlanInfos: BillingSubscriptionPlanInfoForCloudLicenseResponse[];
}
