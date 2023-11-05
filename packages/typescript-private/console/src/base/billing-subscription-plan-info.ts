import { propertiesOf } from '@dogu-tech/common';
import { BillingPeriod, BillingSubscriptionPlanData } from './billing';
import { BillingCouponBase } from './billing-coupon';
import { BillingOrganizationBase } from './billing-organization';
import { BillingSubscriptionPlanSourceBase } from './billing-subscription-plan-source';

export const BillingSubscriptionPlanState = [
  'subscribed',
  'unsubscribed',
  'unsubscribe-requested',
  'change-option-requested',
  'change-period-requested',
  'change-option-and-period-requested',
] as const;
export type BillingSubscriptionPlanState = (typeof BillingSubscriptionPlanState)[number];

export interface BillingSubscriptionPlanInfoBase extends BillingSubscriptionPlanData {
  billingSubscriptionPlanInfoId: string;
  billingOrganizationId: string;
  billingCouponId: string | null;
  billingCouponRemainingApplyCount: number | null;
  billingSubscriptionPlanSourceId: string | null;
  discountedAmount: number | null;
  changeRequestedPeriod: BillingPeriod | null;
  changeRequestedOption: number | null;
  unsubscribedAt: Date | null;
  state: BillingSubscriptionPlanState;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
  billingCoupon?: BillingCouponBase;
  billingSubscriptionPlanSource?: BillingSubscriptionPlanSourceBase;
}

export const BillingSubscriptionPlanProp = propertiesOf<BillingSubscriptionPlanInfoBase>();
