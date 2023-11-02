import { propertiesOf } from '@dogu-tech/common';

import { BillingCouponBase } from './billing-coupon';
import { BillingOrganizationBase } from './billing-organization';
import { BillingSubscriptionPlanSourceBase, BillingSubscriptionPlanSourceData } from './billing-subscription-plan-source';

export interface BillingSubscriptionPlanBase extends BillingSubscriptionPlanSourceData {
  billingSubscriptionPlanId: string;
  billingOrganizationId: string;
  billingCouponId: string | null;
  billingCouponRemainingApplyCount: number | null;
  billingSubscriptionPlanSourceId: string | null;
  lastPurchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
  billingCoupon?: BillingCouponBase;
  billingSubscriptionPlanSource?: BillingSubscriptionPlanSourceBase;
}

export const BillingSubscriptionPlanProp = propertiesOf<BillingSubscriptionPlanBase>();
