import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { BillingCategory, BillingCurrency, BillingPeriod, BillingSubscriptionPlanType } from './billing';

export interface BillingSubscriptionPlanSourceBase {
  billingSubscriptionPlanSourceId: string;
  category: BillingCategory;
  type: BillingSubscriptionPlanType;
  option: number;
  currency: BillingCurrency;
  period: BillingPeriod;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingSubscriptionPlanSourcePropCamel = propertiesOf<BillingSubscriptionPlanSourceBase>();
export const BillingSubscriptionPlanSourcePropSnake = camelToSnakeCasePropertiesOf<BillingSubscriptionPlanSourceBase>();
