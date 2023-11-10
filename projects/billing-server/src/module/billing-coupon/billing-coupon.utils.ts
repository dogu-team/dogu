import { BillingPeriod, BillingResultCode, resultCode } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';

export interface CalculateCouponFactorOptions {
  couponResult: ResolveCouponResultSuccess;
  period: BillingPeriod;
}

export interface CalculateCouponFactorResult {
  firstCouponFactor: number;
  secondCouponFactor: number;
}

export function calculateCouponFactor(options: CalculateCouponFactorOptions): CalculateCouponFactorResult {
  const { couponResult, period } = options;
  if (couponResult.type === 'none') {
    return {
      firstCouponFactor: 1,
      secondCouponFactor: 1,
    };
  }

  const { coupon } = couponResult;
  if (coupon === null) {
    return {
      firstCouponFactor: 1,
      secondCouponFactor: 1,
    };
  }

  if (couponResult.couponRemainingApplyCount !== null && couponResult.couponRemainingApplyCount <= 0) {
    return {
      firstCouponFactor: 1,
      secondCouponFactor: 1,
    };
  }
  const { couponRemainingApplyCount } = couponResult;

  switch (period) {
    case 'monthly': {
      const { monthlyDiscountPercent } = coupon;
      if (monthlyDiscountPercent === null) {
        return {
          firstCouponFactor: 1,
          secondCouponFactor: 1,
        };
      }

      if (couponRemainingApplyCount === null) {
        return {
          firstCouponFactor: 1 - monthlyDiscountPercent / 100,
          secondCouponFactor: 1 - monthlyDiscountPercent / 100,
        };
      }

      if (couponRemainingApplyCount <= 1) {
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
      const { yearlyDiscountPercent } = coupon;
      if (yearlyDiscountPercent === null) {
        return {
          firstCouponFactor: 1,
          secondCouponFactor: 1,
        };
      }

      if (couponRemainingApplyCount === null) {
        return {
          firstCouponFactor: 1 - yearlyDiscountPercent / 100,
          secondCouponFactor: 1 - yearlyDiscountPercent / 100,
        };
      }

      if (couponRemainingApplyCount <= 1) {
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
  period: BillingPeriod;
}

export interface ResolveCouponResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface ResolveCouponResultSuccessNew {
  ok: true;
  type: 'new';
  coupon: BillingCoupon;
  couponRemainingApplyCount: number | null;
}

export interface ResolveCouponResultSuccessOld {
  ok: true;
  type: 'old';
  coupon: BillingCoupon;
  couponRemainingApplyCount: number | null;
}

export interface ResolveCouponResultSuccessNone {
  ok: true;
  type: 'none';
  coupon: null;
}

export type ResolveCouponResultSuccess = ResolveCouponResultSuccessNew | ResolveCouponResultSuccessOld | ResolveCouponResultSuccessNone;

export type ResolveCouponResult = ResolveCouponResultFailure | ResolveCouponResultSuccess;

export function resolveCoupon(options: ResolveCouponOptions): ResolveCouponResult {
  const { billingSubscriptionPlanInfo, newCoupon, period } = options;
  if (newCoupon !== null) {
    switch (period) {
      case 'monthly': {
        return {
          ok: true,
          coupon: newCoupon,
          type: 'new',
          couponRemainingApplyCount: newCoupon.monthlyApplyCount,
        };
      }
      case 'yearly': {
        return {
          ok: true,
          coupon: newCoupon,
          type: 'new',
          couponRemainingApplyCount: newCoupon.yearlyApplyCount,
        };
      }
      default: {
        assertUnreachable(period);
      }
    }
  }

  if (billingSubscriptionPlanInfo === undefined) {
    return {
      ok: true,
      coupon: null,
      type: 'none',
    };
  } else {
    const oldCoupon = billingSubscriptionPlanInfo.billingCoupon ?? null;
    if (oldCoupon === null) {
      return {
        ok: true,
        coupon: null,
        type: 'none',
      };
    }

    if (billingSubscriptionPlanInfo.period === 'monthly' && period === 'yearly') {
      if (oldCoupon.yearlyDiscountPercent !== null) {
        return {
          ok: true,
          coupon: oldCoupon,
          type: 'old',
          couponRemainingApplyCount: oldCoupon.yearlyApplyCount,
        };
      } else {
        return {
          ok: true,
          coupon: null,
          type: 'none',
        };
      }
    } else if (billingSubscriptionPlanInfo.period === 'yearly' && period === 'monthly') {
      if (oldCoupon.monthlyDiscountPercent !== null) {
        return {
          ok: true,
          coupon: oldCoupon,
          type: 'old',
          couponRemainingApplyCount: oldCoupon.monthlyApplyCount,
        };
      } else {
        return {
          ok: true,
          coupon: null,
          type: 'none',
        };
      }
    } else if (billingSubscriptionPlanInfo.period === period) {
      if (billingSubscriptionPlanInfo.couponApplied && billingSubscriptionPlanInfo.couponRemainingApplyCount !== null) {
        // If user change the option with the coupon applied, user can use the existing coupon again.
        return {
          ok: true,
          coupon: oldCoupon,
          type: 'old',
          couponRemainingApplyCount: billingSubscriptionPlanInfo.couponRemainingApplyCount + 1,
        };
      } else {
        return {
          ok: true,
          coupon: oldCoupon,
          type: 'old',
          couponRemainingApplyCount: billingSubscriptionPlanInfo.couponRemainingApplyCount,
        };
      }
    } else {
      return {
        ok: false,
        resultCode: resultCode('unexpected-error', {
          infoPeriod: billingSubscriptionPlanInfo.period,
          period,
        }),
      };
    }
  }
}
