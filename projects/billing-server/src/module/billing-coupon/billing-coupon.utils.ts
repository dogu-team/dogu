import { BillingPeriod, BillingResultCode, resultCode } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';

export interface CalculateCouponFactorOptions {
  couponResult: ResolveCouponResultSuccess;
  period: BillingPeriod;
}

export interface CalculateCouponFactorResult {
  firstCouponFactor: number;
  secondCouponFactor: number;
}

export function calculateCouponFactor(options: CalculateCouponFactorOptions): CalculateCouponFactorResult {
  const toFixed = (value: number): number => parseFloat(value.toFixed(2));

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
      const { discountPercent } = coupon;
      if (couponRemainingApplyCount === null) {
        return {
          firstCouponFactor: toFixed(1 - discountPercent / 100),
          secondCouponFactor: toFixed(1 - discountPercent / 100),
        };
      }

      if (couponRemainingApplyCount <= 1) {
        return {
          firstCouponFactor: toFixed(1 - discountPercent / 100),
          secondCouponFactor: 1,
        };
      }

      return {
        firstCouponFactor: toFixed(1 - discountPercent / 100),
        secondCouponFactor: toFixed(1 - discountPercent / 100),
      };
    }
    case 'yearly': {
      const { discountPercent } = coupon;
      if (couponRemainingApplyCount === null) {
        return {
          firstCouponFactor: toFixed(1 - discountPercent / 100),
          secondCouponFactor: toFixed(1 - discountPercent / 100),
        };
      }

      if (couponRemainingApplyCount <= 1) {
        return {
          firstCouponFactor: toFixed(1 - discountPercent / 100),
          secondCouponFactor: 1,
        };
      }

      return {
        firstCouponFactor: toFixed(1 - discountPercent / 100),
        secondCouponFactor: toFixed(1 - discountPercent / 100),
      };
    }
    default: {
      assertUnreachable(period);
    }
  }
}

export interface ResolveCouponOptions {
  billingPlanInfo: BillingPlanInfo | undefined;
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
  const { billingPlanInfo, newCoupon, period } = options;
  if (newCoupon !== null) {
    switch (period) {
      case 'monthly': {
        return {
          ok: true,
          coupon: newCoupon,
          type: 'new',
          couponRemainingApplyCount: newCoupon.applyCount,
        };
      }
      case 'yearly': {
        return {
          ok: true,
          coupon: newCoupon,
          type: 'new',
          couponRemainingApplyCount: newCoupon.applyCount,
        };
      }
      default: {
        assertUnreachable(period);
      }
    }
  }

  if (billingPlanInfo === undefined) {
    return {
      ok: true,
      coupon: null,
      type: 'none',
    };
  } else {
    const oldCoupon = billingPlanInfo.billingCoupon ?? null;
    if (oldCoupon === null) {
      return {
        ok: true,
        coupon: null,
        type: 'none',
      };
    }

    if (billingPlanInfo.period === 'monthly' && period === 'yearly') {
      return {
        ok: true,
        coupon: null,
        type: 'none',
      };
    } else if (billingPlanInfo.period === 'yearly' && period === 'monthly') {
      return {
        ok: true,
        coupon: null,
        type: 'none',
      };
    } else if (billingPlanInfo.period === period) {
      if (billingPlanInfo.couponApplied && billingPlanInfo.couponRemainingApplyCount !== null) {
        // If user change the option with the coupon applied, user can use the existing coupon again.
        return {
          ok: true,
          coupon: oldCoupon,
          type: 'old',
          couponRemainingApplyCount: billingPlanInfo.couponRemainingApplyCount + 1,
        };
      } else {
        return {
          ok: true,
          coupon: oldCoupon,
          type: 'old',
          couponRemainingApplyCount: billingPlanInfo.couponRemainingApplyCount,
        };
      }
    } else {
      return {
        ok: false,
        resultCode: resultCode('unexpected-error', {
          infoPeriod: billingPlanInfo.period,
          period,
        }),
      };
    }
  }
}
