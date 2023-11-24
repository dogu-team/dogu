import { propertiesOf } from '@dogu-tech/common';
import { IsUUID } from 'class-validator';
import { BillingSubscriptionPlanData } from './billing';
import { BillingOrganizationBase } from './billing-organization';

export interface BillingSubscriptionPlanSourceBase extends BillingSubscriptionPlanData {
  billingSubscriptionPlanSourceId: number;
  name: string;
  billingOrganizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
}

export const BillingSubscriptionPlanSourceProp = propertiesOf<BillingSubscriptionPlanSourceBase>();

export class FindBillingSubscriptionPlanSourcesDto {
  @IsUUID()
  organizationId!: string;
}
