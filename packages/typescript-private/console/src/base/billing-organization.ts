import { propertiesOf } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsIn, IsUUID, ValidateNested } from 'class-validator';
import { BillingCategory, BillingCurrency } from './billing';
import { BillingMethodNiceBase } from './billing-method-nice';
import { RegisterCardDto } from './billing-purchase';
import { BillingSubscriptionPlanInfoBase } from './billing-subscription-plan-info';

export interface BillingOrganizationBase {
  billingOrganizationId: string;
  organizationId: string;
  category: BillingCategory;
  currency: BillingCurrency | null;

  /**
   * @description format (+|-)\d{2}:\d{2}
   */
  timezoneOffset: string | null;

  /**
   * @description this value is used for yearly purchase days calculation.
   */
  yearlyCalculationStartedAt: Date | null;

  /**
   * @description this value is used for yearly purchase days calculation.
   */
  yearlyCalculationExpiredAt: Date | null;

  /**
   * @description this value is used for monthly purchase days calculation.
   */
  monthlyCalculationStartedAt: Date | null;

  /**
   * @description this value is used for monthly purchase days calculation.
   */
  monthlyCalculationExpiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingSubscriptionPlanInfos?: BillingSubscriptionPlanInfoBase[];
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
