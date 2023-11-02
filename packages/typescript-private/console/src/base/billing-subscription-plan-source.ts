import { propertiesOf } from '@dogu-tech/common';
import { BillingCategory, BillingCurrency, BillingPeriod, BillingSubscriptionPlanType } from './billing';

export interface BillingSubscriptionPlanSourceData {
  category: BillingCategory;
  type: BillingSubscriptionPlanType;
  option: number;
  currency: BillingCurrency;
  period: BillingPeriod;
  originPrice: number;
}

export interface BillingSubscriptionPlanSourceBase extends BillingSubscriptionPlanSourceData {
  billingSubscriptionPlanSourceId: string;
  billingOrganizationId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingSubscriptionPlanSourceProp = propertiesOf<BillingSubscriptionPlanSourceBase>();
