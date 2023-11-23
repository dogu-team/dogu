import { OrganizationId } from '@dogu-private/types';
import { IsFilledString, propertiesOf } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsUUID } from 'class-validator';
import { BillingResult } from '..';
import { BillingCategory, BillingCurrency, BillingPeriod, BillingSubscriptionPlanType } from './billing';
import { BillingOrganizationBase } from './billing-organization';

export interface BillingMethodPaddleBase {
  billingMethodPaddleId: string;
  billingOrganizationId: string;
  customerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
}

export const BillingMethodPaddleProp = propertiesOf<BillingMethodPaddleBase>();

export class CreateOrUpdateMethodPaddleDto {
  @IsUUID()
  organizationId!: OrganizationId;

  @IsFilledString()
  email!: string;
}

export class PaddlePriceSourceDto {}

export class FindPaddlePriceDto {
  @IsUUID()
  organizationId!: OrganizationId;

  @IsIn(BillingCategory)
  category!: BillingCategory;

  @IsIn(BillingSubscriptionPlanType)
  subscriptionPlanType!: BillingSubscriptionPlanType;

  @IsNumber()
  @Type(() => Number)
  option!: number;

  @IsIn(BillingCurrency)
  currency!: BillingCurrency;

  @IsIn(BillingPeriod)
  period!: BillingPeriod;
}

export interface PaddlePrice {
  priceId: string;
}

export type FindPaddlePriceResponse = BillingResult<PaddlePrice>;
