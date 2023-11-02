import { propertiesOf } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsIn, IsUUID, ValidateNested } from 'class-validator';
import { BillingCategory, BillingCurrency } from './billing';
import { BillingMethodNiceBase } from './billing-method-nice';
import { RegisterCardDto } from './billing-purchase';
import { BillingSubscriptionPlanBase } from './billing-subscription-plan';

export interface BillingOrganizationBase {
  billingOrganizationId: string;
  organizationId: string;
  category: BillingCategory;
  currency: BillingCurrency | null;

  /**
   * @note monthly purchase date and yearly purchase date are same with first purchase date
   */
  firstPurchasedAt: Date | null;
  lastMonthlyPurchasedAt: Date | null;
  lastYearlyPurchasedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingSubscriptionPlans?: BillingSubscriptionPlanBase[];
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
