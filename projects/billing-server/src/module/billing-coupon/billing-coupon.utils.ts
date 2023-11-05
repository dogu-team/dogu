import { BillingPeriod } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';

export interface CalculateCouponFactorOptions {
  coupon: BillingCoupon | null;
  period: BillingPeriod;
}

export interface CalculateCouponFactorResult {
  couponFactor: number;
  nextCouponFactor: number;
}

export function calculateCouponFactor(options: CalculateCouponFactorOptions): CalculateCouponFactorResult {
  const { coupon, period } = options;
  if (coupon === null) {
    return {
      couponFactor: 1,
      nextCouponFactor: 1,
    };
  }

  switch (period) {
    case 'monthly': {
      const { monthlyDiscountPercent, monthlyApplyCount } = coupon;
      if (monthlyDiscountPercent === null) {
        return {
          couponFactor: 1,
          nextCouponFactor: 1,
        };
      }

      if (monthlyApplyCount === null) {
        return {
          couponFactor: 1 - monthlyDiscountPercent / 100,
          nextCouponFactor: 1 - monthlyDiscountPercent / 100,
        };
      }

      if (monthlyApplyCount <= 1) {
        return {
          couponFactor: 1 - monthlyDiscountPercent / 100,
          nextCouponFactor: 1,
        };
      }

      return {
        couponFactor: 1 - monthlyDiscountPercent / 100,
        nextCouponFactor: 1 - monthlyDiscountPercent / 100,
      };
    }
    case 'yearly': {
      const { yearlyDiscountPercent, yearlyApplyCount } = coupon;
      if (yearlyDiscountPercent === null) {
        return {
          couponFactor: 1,
          nextCouponFactor: 1,
        };
      }

      if (yearlyApplyCount === null) {
        return {
          couponFactor: 1 - yearlyDiscountPercent / 100,
          nextCouponFactor: 1 - yearlyDiscountPercent / 100,
        };
      }

      if (yearlyApplyCount <= 1) {
        return {
          couponFactor: 1 - yearlyDiscountPercent / 100,
          nextCouponFactor: 1,
        };
      }

      return {
        couponFactor: 1 - yearlyDiscountPercent / 100,
        nextCouponFactor: 1 - yearlyDiscountPercent / 100,
      };
    }
    default:
      assertUnreachable(period);
  }
}
