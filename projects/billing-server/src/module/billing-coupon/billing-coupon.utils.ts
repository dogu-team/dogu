import { BillingPeriod } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';

export interface CalculateCouponFactorOptions {
  coupon: BillingCoupon | null;
  period: BillingPeriod;
}

export interface CalculateCouponFactorResult {
  firstCouponFactor: number;
  secondCouponFactor: number;
}

export function calculateCouponFactor(options: CalculateCouponFactorOptions): CalculateCouponFactorResult {
  const { coupon, period } = options;
  if (coupon === null) {
    return {
      firstCouponFactor: 1,
      secondCouponFactor: 1,
    };
  }

  switch (period) {
    case 'monthly': {
      const { monthlyDiscountPercent, monthlyApplyCount } = coupon;
      if (monthlyDiscountPercent === null) {
        return {
          firstCouponFactor: 1,
          secondCouponFactor: 1,
        };
      }

      if (monthlyApplyCount === null) {
        return {
          firstCouponFactor: 1 - monthlyDiscountPercent / 100,
          secondCouponFactor: 1 - monthlyDiscountPercent / 100,
        };
      }

      if (monthlyApplyCount <= 1) {
        return {
          firstCouponFactor: 1 - monthlyDiscountPercent / 100,
          secondCouponFactor: 1,
        };
      }

      return {
        firstCouponFactor: 1 - monthlyDiscountPercent / 100,
        secondCouponFactor: 1 - monthlyDiscountPercent / 100,
      };
    }
    case 'yearly': {
      const { yearlyDiscountPercent, yearlyApplyCount } = coupon;
      if (yearlyDiscountPercent === null) {
        return {
          firstCouponFactor: 1,
          secondCouponFactor: 1,
        };
      }

      if (yearlyApplyCount === null) {
        return {
          firstCouponFactor: 1 - yearlyDiscountPercent / 100,
          secondCouponFactor: 1 - yearlyDiscountPercent / 100,
        };
      }

      if (yearlyApplyCount <= 1) {
        return {
          firstCouponFactor: 1 - yearlyDiscountPercent / 100,
          secondCouponFactor: 1,
        };
      }

      return {
        firstCouponFactor: 1 - yearlyDiscountPercent / 100,
        secondCouponFactor: 1 - yearlyDiscountPercent / 100,
      };
    }
    default: {
      assertUnreachable(period);
    }
  }
}

export interface ResolveCouponOptions {
  billingSubscriptionPlanInfo: BillingSubscriptionPlanInfo | undefined;
  newCoupon: BillingCoupon | null;
  isChangePeriod: boolean;
}

export interface ResolveCouponResult {
  coupon: BillingCoupon | null;
  newCoupon: BillingCoupon | null;
  oldCoupon: BillingCoupon | null;
  type: 'new' | 'old' | null;
}

export function resolveCoupon(options: ResolveCouponOptions): ResolveCouponResult {
  const { billingSubscriptionPlanInfo, newCoupon, isChangePeriod } = options;
  const isNewSubscription = billingSubscriptionPlanInfo === null;
  const oldCoupon = billingSubscriptionPlanInfo?.billingCoupon ?? null;
  if (isNewSubscription) {
    if (newCoupon === null) {
      return {
        coupon: null,
        newCoupon: null,
        oldCoupon: null,
        type: null,
      };
    } else {
      return {
        coupon: newCoupon,
        newCoupon,
        oldCoupon: null,
        type: 'new',
      };
    }
  } else {
    if (isChangePeriod) {
      if (newCoupon === null) {
        return {
          coupon: oldCoupon,
          newCoupon: null,
          oldCoupon,
          type: 'old',
        };
      } else {
        return {
          coupon: newCoupon,
          newCoupon,
          oldCoupon,
          type: 'new',
        };
      }
    } else {
      return {
        coupon: oldCoupon,
        newCoupon: null,
        oldCoupon,
        type: 'old',
      };
    }
  }
}
