import { propertiesOf } from '@dogu-tech/common';
import { IsUUID } from 'class-validator';
import { BillingMethod } from './billing';
import { BillingOrganizationBase } from './billing-organization';
import { BillingSubscriptionPlanHistoryBase } from './billing-subscription-plan-history';

export interface BillingPurchaseHistoryBase {
  billingPurchaseHistoryId: string;
  billingOrganizationId: string;
  purchasedAt: Date;
  method: BillingMethod;
  niceSubscribePaymentsResponse: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
  billingSubscriptionPlanHistories?: BillingSubscriptionPlanHistoryBase[];
}

export const BillingPurchaseHistoryProp = propertiesOf<BillingPurchaseHistoryBase>();

export class GetBillingPurchaseHistoriesDto {
  @IsUUID()
  organizationId!: string;
}
