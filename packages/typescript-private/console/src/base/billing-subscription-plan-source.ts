import { propertiesOf } from '@dogu-tech/common';
import { BillingSubscriptionPlanData } from './billing';

export interface BillingSubscriptionPlanSourceBase extends BillingSubscriptionPlanData {
  billingSubscriptionPlanSourceId: string;
  billingOrganizationId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingSubscriptionPlanSourceProp = propertiesOf<BillingSubscriptionPlanSourceBase>();
