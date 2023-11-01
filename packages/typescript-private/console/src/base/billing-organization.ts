import { camelToSnakeCasePropertiesOf, IsFilledString, propertiesOf } from '@dogu-tech/common';
import { IsIn, IsUUID } from 'class-validator';
import { BillingCategory } from './billing';
import { BillingMethodNiceBase } from './billing-method-nice';
import { BillingSubscriptionPlanBase } from './billing-subscription-plan';

export interface BillingOrganizationBase {
  billingOrganizationId: string;
  organizationId: string;
  category: BillingCategory;
  firstPurchasedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingSubscriptionPlans?: BillingSubscriptionPlanBase[];
  billingMethodNice?: BillingMethodNiceBase;
}

export const BillingOrganizationPropCamel = propertiesOf<BillingOrganizationBase>();
export const BillingOrganizationPropSnake = camelToSnakeCasePropertiesOf<BillingOrganizationBase>();

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

  @IsFilledString()
  cardNo!: string;

  @IsFilledString()
  expYear!: string;

  @IsFilledString()
  expMonth!: string;

  @IsFilledString()
  idNo!: string;

  @IsFilledString()
  cardPw!: string;
}
