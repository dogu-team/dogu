import { camelToSnakeCasePropertiesOf, IsFilledString, propertiesOf } from '@dogu-tech/common';
import { IsIn, IsUUID } from 'class-validator';
import { BillingCategory } from './billing';
import { BillingMethodNiceBase } from './billing-method-nice';
import { BillingSubscriptionPlanBase } from './billing-subscription-plan';

export interface BillingInfoBase {
  billingInfoId: string;
  organizationId: string;
  category: BillingCategory;
  firstPurchasedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingSubscriptionPlans?: BillingSubscriptionPlanBase[];
  billingMethodNice?: BillingMethodNiceBase;
}

export const BillingInfoPropCamel = propertiesOf<BillingInfoBase>();
export const BillingInfoPropSnake = camelToSnakeCasePropertiesOf<BillingInfoBase>();

export class FindBillingInfoDto {
  @IsUUID()
  organizationId!: string;
}

export class CreateBillingInfoDto {
  @IsUUID()
  organizationId!: string;

  @IsIn(BillingCategory)
  category!: BillingCategory;
}

export class CreateOrUpdateBillingInfoWithNiceDto {
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
