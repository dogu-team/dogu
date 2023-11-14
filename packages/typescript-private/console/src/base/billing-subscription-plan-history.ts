import { propertiesOf } from '@dogu-tech/common';
import { BillingPeriod, BillingSubscriptionPlanData } from './billing';
import { BillingCouponBase } from './billing-coupon';
import { BillingHistoryBase, BillingHistoryType } from './billing-history';
import { BillingOrganizationBase } from './billing-organization';
import { BillingSubscriptionPlanSourceBase } from './billing-subscription-plan-source';

export interface BillingSubscriptionPlanHistoryData extends BillingSubscriptionPlanData {
  billingCouponId: string | null;
  billingSubscriptionPlanSourceId: string | null;
  discountedAmount: number | null;
  purchasedAmount: number | null;
  startedAt: Date | null;
  expiredAt: Date | null;
  elapsedDays: number | null;
  elapsedDiscountedAmount: number | null;
  previousRemainingDays: number | null;
  previousRemainingDiscountedAmount: number | null;
  previousOption: number | null;
  previousPeriod: BillingPeriod | null;
}

export interface BillingSubscriptionPlanHistoryBase extends BillingSubscriptionPlanHistoryData {
  billingSubscriptionPlanHistoryId: string;
  billingOrganizationId: string;
  billingHistoryId: string;
  historyType: BillingHistoryType;
  purchasedBillingSubscriptionPlanHistoryId: string | null;
  refundedAmount: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
  billingCoupon?: BillingCouponBase;
  billingSubscriptionPlanSource?: BillingSubscriptionPlanSourceBase;
  billingHistory?: BillingHistoryBase;
}

export const BillingSubscriptionPlanHistoryProp = propertiesOf<BillingSubscriptionPlanHistoryBase>();
