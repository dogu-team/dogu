import { assertUnreachable } from '@dogu-tech/common';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';

export function applyChangeRequested(planInfo: BillingPlanInfo): void {
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

export function clearChangeRequested(planInfo: BillingPlanInfo): void {
  planInfo.changeRequestedOption = null;
  planInfo.changeRequestedPeriod = null;
  planInfo.changeRequestedOriginPrice = null;
  planInfo.changeRequestedDiscountedAmount = null;
}

export function invalidatePlanInfo(planInfo: BillingPlanInfo, now: Date): BillingPlanInfo {
  planInfo.billingPlanHistoryId = null;
  if (planInfo.state !== 'unsubscribed') {
    clearChangeRequested(planInfo);
    planInfo.state = 'unsubscribed';
    planInfo.unsubscribedAt = now;
  }

  return planInfo;
}

export function applyPlanInfoState(planInfo: BillingPlanInfo, now: Date): BillingPlanInfo {
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
  planInfo: BillingPlanInfo;
  discountedAmount: number;
  purchaseAmount: number;
}

export function calculatePurchaseAmountAndApplyCouponCount(planInfo: BillingPlanInfo): PurchaseAmountInfo {
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

  if (!billingCoupon) {
    return clearAndReturn();
  }

  if (planInfo.couponRemainingApplyCount !== null && planInfo.couponRemainingApplyCount <= 0) {
    return clearAndReturn();
  }

  const isApplyDiscount = planInfo.couponRemainingApplyCount === null || planInfo.couponRemainingApplyCount > 0;
  const discountedAmount = isApplyDiscount ? Math.floor((originPrice * billingCoupon.discountPercent) / 100) : 0;

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
