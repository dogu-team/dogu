import { BillingPeriod, BillingResultCode, resultCode } from '@dogu-private/console';
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
}

export interface ResolveCouponResultSuccessOld {
  ok: true;
  type: 'old';
  coupon: BillingCoupon;
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
    return {
      ok: true,
      coupon: newCoupon,
      type: 'new',
    };
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
        };
      } else {
        return {
          ok: true,
          coupon: null,
          type: 'none',
        };
      }
    } else if (billingSubscriptionPlanInfo.period === period) {
      return {
        ok: true,
        coupon: oldCoupon,
        type: 'old',
      };
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
