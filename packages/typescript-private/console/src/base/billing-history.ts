import { propertiesOf } from '@dogu-tech/common';
import { IsUUID } from 'class-validator';
import { BillingOrganizationBase } from './billing-organization';
import { BillingSubscriptionPlanBase } from './billing-subscription-plan';

export interface BillingHistoryBase {
  billingHistoryId: string;
  purchasedAt: Date;
  billingOrganizationId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
  billingSubscriptionPlans?: BillingSubscriptionPlanBase[];
}

export const BillingHistoryProp = propertiesOf<BillingHistoryBase>();

export class GetBillingHistoriesDto {
  @IsUUID()
  organizationId!: string;
}
