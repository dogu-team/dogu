import { propertiesOf } from '@dogu-tech/common';
import { BillingPeriod, BillingPlanData } from './billing';
import { BillingCouponBase } from './billing-coupon';
import { BillingHistoryBase, BillingHistoryType } from './billing-history';
import { BillingOrganizationBase } from './billing-organization';
import { BillingPlanSourceBase } from './billing-plan-source';

export interface BillingPlanHistoryData extends BillingPlanData {
  billingCouponId: string | null;
  billingPlanSourceId: number | null;
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

export interface BillingPlanHistoryBase extends BillingPlanHistoryData {
  billingPlanHistoryId: string;
  billingOrganizationId: string;
  billingHistoryId: string;
  historyType: BillingHistoryType;
  purchasedBillingPlanHistoryId: string | null;
  refundedAmount: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
  billingCoupon?: BillingCouponBase;
  billingPlanSource?: BillingPlanSourceBase;
  billingHistory?: BillingHistoryBase;
}

export const BillingPlanHistoryProp = propertiesOf<BillingPlanHistoryBase>();
