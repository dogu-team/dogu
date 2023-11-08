import { propertiesOf } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { PageDtoBase } from '../dto/pagination/page.dto';
import { BillingCurrency, BillingMethod } from './billing';
import { BillingOrganizationBase } from './billing-organization';
import { BillingSubscriptionPlanHistoryBase } from './billing-subscription-plan-history';

export interface BillingHistoryBase {
  billingHistoryId: string;
  billingOrganizationId: string;
  purchasedAt: Date;
  method: BillingMethod;
  niceSubscribePaymentsResponse: Record<string, unknown> | null;
  previewResponse: Record<string, unknown>;
  totalPrice: number;
  currency: BillingCurrency;
  goodsName: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
  billingSubscriptionPlanHistories?: BillingSubscriptionPlanHistoryBase[];
}

export const BillingHistoryProp = propertiesOf<BillingHistoryBase>();

export class GetBillingHistoriesDto implements PageDtoBase {
  @IsUUID()
  organizationId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  page = 1;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  offset = 10;
}
