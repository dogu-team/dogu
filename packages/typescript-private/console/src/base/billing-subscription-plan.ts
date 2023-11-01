import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

import { BillingCategory, BillingCurrency, BillingPeriod, BillingSubscriptionPlanType } from './billing';
import { BillingCouponBase } from './billing-coupon';
import { BillingOrganizationBase } from './billing-organization';
import { BillingSubscriptionPlanSourceBase } from './billing-subscription-plan-source';

export interface BillingSubscriptionPlanBase {
  billingSubscriptionPlanId: string;
  category: BillingCategory;
  type: BillingSubscriptionPlanType;
  option: number;
  currency: BillingCurrency;
  period: BillingPeriod;
  price: number;
  billingOrganizationId: string;
  billingCouponId: string | null;
  billingCouponRemainingApplyCount: number | null;
  billingSubscriptionPlanSourceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
  billingCoupon?: BillingCouponBase;
  billingSubscriptionPlanSource?: BillingSubscriptionPlanSourceBase;
}

export const BillingSubscriptionPlanPropCamel = propertiesOf<BillingSubscriptionPlanBase>();
export const BillingSubscriptionPlanPropSnake = camelToSnakeCasePropertiesOf<BillingSubscriptionPlanBase>();
