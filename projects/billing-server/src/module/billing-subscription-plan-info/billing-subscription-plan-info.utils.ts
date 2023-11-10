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

export function updateSubscriptionPlanInfoState(planInfo: BillingSubscriptionPlanInfo, now: Date): BillingSubscriptionPlanInfo {
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

export function calculatePurchaseAmountAndUpdateCouponCount(planInfo: BillingSubscriptionPlanInfo): PurchaseAmountInfo {
  const { originPrice, discountedAmount } = planInfo;
  if (planInfo.couponRemainingApplyCount === null) {
    const purchaseAmount = originPrice - discountedAmount;
    return {
      planInfo,
      discountedAmount,
      purchaseAmount,
    };
  }

  if (planInfo.couponRemainingApplyCount > 0) {
    planInfo.couponRemainingApplyCount -= 1;
    const purchaseAmount = originPrice - discountedAmount;
    return {
      planInfo,
      discountedAmount,
      purchaseAmount,
    };
  }

  const purchaseAmount = originPrice;
  return {
    planInfo,
    discountedAmount: 0,
    purchaseAmount,
  };
}
