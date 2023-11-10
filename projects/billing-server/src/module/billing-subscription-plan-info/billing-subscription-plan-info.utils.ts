import { assertUnreachable } from '@dogu-tech/common';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';

export function applyChangeRequested(planInfo: BillingSubscriptionPlanInfo): void {
  if (planInfo.changeRequestedOption) {
    planInfo.option = planInfo.changeRequestedOption;
  }
  if (planInfo.changeRequestedPeriod) {
    planInfo.period = planInfo.changeRequestedPeriod;
  }
  if (planInfo.changeRequestedOriginPrice) {
    planInfo.originPrice = planInfo.changeRequestedOriginPrice;
  }
  if (planInfo.changeRequestedDiscountedAmount) {
    planInfo.discountedAmount = planInfo.changeRequestedDiscountedAmount;
  }
  clearChangeRequested(planInfo);
}

export function clearChangeRequested(planInfo: BillingSubscriptionPlanInfo): void {
  planInfo.changeRequestedOption = null;
  planInfo.changeRequestedPeriod = null;
  planInfo.changeRequestedOriginPrice = null;
  planInfo.changeRequestedDiscountedAmount = null;
}

export function invalidateSubscriptionPlanInfo(planInfo: BillingSubscriptionPlanInfo, now: Date): BillingSubscriptionPlanInfo {
  planInfo.billingSubscriptionPlanHistoryId = null;
  if (planInfo.state !== 'unsubscribed') {
    clearChangeRequested(planInfo);
    planInfo.state = 'unsubscribed';
    planInfo.unsubscribedAt = now;
  }

  return planInfo;
}

export function applySubscriptionPlanInfoState(planInfo: BillingSubscriptionPlanInfo, now: Date): BillingSubscriptionPlanInfo {
  const { state } = planInfo;
  switch (state) {
    case 'unsubscribed': {
      return planInfo;
    }
    case 'unsubscribe-requested': {
      planInfo.state = 'unsubscribed';
      planInfo.unsubscribedAt = now;
      return planInfo;
    }
    case 'change-option-or-period-requested': {
      applyChangeRequested(planInfo);
      planInfo.state = 'subscribed';
      return planInfo;
    }
    case 'subscribed': {
      return planInfo;
    }
    default: {
      assertUnreachable(state);
    }
  }
}

export interface PurchaseAmountInfo {
  planInfo: BillingSubscriptionPlanInfo;
  discountedAmount: number;
  purchaseAmount: number;
}

export function calculatePurchaseAmountAndApplyCouponCount(planInfo: BillingSubscriptionPlanInfo): PurchaseAmountInfo {
  const { originPrice, period, billingCoupon } = planInfo;

  const clearAndReturn = (): PurchaseAmountInfo => {
    planInfo.couponApplied = false;
    const purchaseAmount = originPrice;
    return {
      planInfo,
      discountedAmount: 0,
      purchaseAmount,
    };
  };

  if (billingCoupon === undefined) {
    return clearAndReturn();
  }

  if (planInfo.couponRemainingApplyCount !== null && planInfo.couponRemainingApplyCount <= 0) {
    return clearAndReturn();
  }

  const isApplyDiscount = planInfo.couponRemainingApplyCount === null || planInfo.couponRemainingApplyCount > 0;
  let discountedAmount = 0;
  if (isApplyDiscount) {
    switch (period) {
      case 'monthly': {
        const discountPercent = billingCoupon.monthlyDiscountPercent;
        if (discountPercent === null) {
          return clearAndReturn();
        }

        discountedAmount = Math.floor((originPrice * discountPercent) / 100);
        break;
      }
      case 'yearly': {
        const discountPercent = billingCoupon.yearlyDiscountPercent;
        if (discountPercent === null) {
          return clearAndReturn();
        }

        discountedAmount = Math.floor((originPrice * discountPercent) / 100);
        break;
      }
      default: {
        assertUnreachable(period);
      }
    }
  }

  if (planInfo.couponRemainingApplyCount !== null && planInfo.couponRemainingApplyCount > 0) {
    planInfo.couponRemainingApplyCount -= 1;
  }

  planInfo.discountedAmount = discountedAmount;
  planInfo.couponApplied = true;
  const purchaseAmount = originPrice - discountedAmount;
  return {
    planInfo,
    discountedAmount,
    purchaseAmount,
  };
}
