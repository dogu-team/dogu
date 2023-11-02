import { BillingCouponBase, BillingCurrency, BillingPeriod } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { DateTime } from 'luxon';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlan } from '../../db/entity/billing-subscription-plan.entity';

export function calculateNextPurchaseAt(billingOrganization: BillingOrganization, period: BillingPeriod): Date {
  switch (period) {
    case 'monthly': {
      /**
       * @note treat today as lastMonthlyPurchasedAt if lastMonthlyPurchasedAt is null
       */
      const lastMonthlyPurchasedAt = billingOrganization.lastMonthlyPurchasedAt ?? new Date();
      return DateTime.fromJSDate(lastMonthlyPurchasedAt).plus({ month: 1 }).toJSDate();
    }
    case 'yearly': {
      /**
       * @note treat today as lastYearlyPurchasedAt if lastYearlyPurchasedAt is null
       */
      const lastYearlyPurchasedAt = billingOrganization.lastYearlyPurchasedAt ?? new Date();
      return DateTime.fromJSDate(lastYearlyPurchasedAt).plus({ year: 1 }).toJSDate();
    }
    default:
      assertUnreachable(period);
  }
}

export function getLastPurchasedAt(billingOrganization: BillingOrganization, period: BillingPeriod): Date | null {
  switch (period) {
    case 'monthly':
      return billingOrganization.lastMonthlyPurchasedAt;
    case 'yearly':
      return billingOrganization.lastYearlyPurchasedAt;
    default:
      assertUnreachable(period);
  }
}

export function parseDiscountPercent(value: number | null): number {
  const monthlyDiscountPercent = value === null ? 0 : value;
  return monthlyDiscountPercent;
}

export function discountPercentToFactor(percent: number): number {
  return (100 - percent) / 100;
}

export function calculateCouponFactor(coupon: BillingCouponBase | null | undefined, period: BillingPeriod): number {
  if (!coupon) {
    return 1;
  }

  switch (period) {
    case 'monthly': {
      const monthlyDiscountPercent = parseDiscountPercent(coupon.monthlyDiscountPercent);
      return discountPercentToFactor(monthlyDiscountPercent);
    }
    case 'yearly': {
      const yearlyDiscountPercent = parseDiscountPercent(coupon.yearlyDiscountPercent);
      return discountPercentToFactor(yearlyDiscountPercent);
    }
    default:
      assertUnreachable(period);
  }
}

export function calculateNextCouponFactor(coupon: BillingCouponBase | null, period: BillingPeriod): number {
  if (!coupon) {
    return 1;
  }

  switch (period) {
    case 'monthly': {
      const monthlyDiscountPercent = parseDiscountPercent(coupon.monthlyDiscountPercent);
      if (coupon.monthlyApplyCount === null) {
        // @note apply infinitly
        return discountPercentToFactor(monthlyDiscountPercent);
      } else if (coupon.monthlyApplyCount > 1) {
        return discountPercentToFactor(monthlyDiscountPercent);
      } else {
        return 1;
      }
    }
    case 'yearly': {
      const yearlyDiscountPercent = parseDiscountPercent(coupon.yearlyDiscountPercent);
      if (coupon.yearlyApplyCount === null) {
        // @note apply infinitly
        return discountPercentToFactor(yearlyDiscountPercent);
      } else if (coupon.yearlyApplyCount > 1) {
        return discountPercentToFactor(yearlyDiscountPercent);
      } else {
        return 1;
      }
    }
    default:
      assertUnreachable(period);
  }
}

export function calculateNextPurchasePriceFromSubscriptionPlan(subscriptionPlan: BillingSubscriptionPlan): number {
  if (subscriptionPlan.billingCouponRemainingApplyCount === null) {
    return subscriptionPlan.originPrice;
  }

  if (subscriptionPlan.billingCouponRemainingApplyCount < 1) {
    return subscriptionPlan.originPrice;
  }

  switch (subscriptionPlan.period) {
    case 'monthly': {
      const monthlyDiscountPercent = parseDiscountPercent(subscriptionPlan.billingCoupon?.monthlyDiscountPercent ?? null);
      return subscriptionPlan.originPrice * discountPercentToFactor(monthlyDiscountPercent);
    }
    case 'yearly': {
      const yearlyDiscountPercent = parseDiscountPercent(subscriptionPlan.billingCoupon?.yearlyDiscountPercent ?? null);
      return subscriptionPlan.originPrice * discountPercentToFactor(yearlyDiscountPercent);
    }
    default:
      assertUnreachable(subscriptionPlan.period);
  }
}

export function calculateRemainingDays(period: BillingPeriod, nextPerchaseAt: Date): number {
  switch (period) {
    case 'monthly':
      return DateTime.fromJSDate(new Date()).plus({ month: 1 }).diff(DateTime.fromJSDate(nextPerchaseAt), 'days').days;
    case 'yearly':
      return DateTime.fromJSDate(new Date()).plus({ year: 1 }).diff(DateTime.fromJSDate(nextPerchaseAt), 'days').days;
    default:
      assertUnreachable(period);
  }
}

export function calculatePeriodDays(billingOrganization: BillingOrganization, period: BillingPeriod, nextPurchaseAt: Date): number {
  switch (period) {
    case 'monthly': {
      const lastMonthlyPurchasedAt = billingOrganization.lastMonthlyPurchasedAt ?? new Date();
      return DateTime.fromJSDate(nextPurchaseAt).diff(DateTime.fromJSDate(lastMonthlyPurchasedAt), 'days').days;
    }
    case 'yearly': {
      const lastYearlyPurchasedAt = billingOrganization.lastYearlyPurchasedAt ?? new Date();
      return DateTime.fromJSDate(nextPurchaseAt).diff(DateTime.fromJSDate(lastYearlyPurchasedAt), 'days').days;
    }
    default:
      assertUnreachable(period);
  }
}

export function calculateElapsedDays(period: BillingPeriod, lastPurchasedAt: Date): number {
  switch (period) {
    case 'monthly':
      return DateTime.fromJSDate(new Date()).diff(DateTime.fromJSDate(lastPurchasedAt), 'days').days;
    case 'yearly':
      return DateTime.fromJSDate(new Date()).diff(DateTime.fromJSDate(lastPurchasedAt), 'days').days;
    default:
      assertUnreachable(period);
  }
}

export function resolveCurrency(billingOrganization: BillingOrganization, argumentCurrency: BillingCurrency): BillingCurrency {
  const currency = billingOrganization.currency ?? argumentCurrency;
  return currency;
}

export function calculateNextPurchaseTotalPriceFromSubscriptionPlans(subscriptionPlans: BillingSubscriptionPlan[], period: BillingPeriod): number {
  switch (period) {
    case 'monthly': {
      const monthlySubscriptionPlans = subscriptionPlans.filter((plan) => plan.period === 'monthly');
      const nextPurchaseTotalPrice = monthlySubscriptionPlans.reduce((acc, plan) => {
        return acc + calculateNextPurchasePriceFromSubscriptionPlan(plan);
      }, 0);
      return nextPurchaseTotalPrice;
    }
    case 'yearly': {
      const yearlyBillingSubscriptionPlans = subscriptionPlans.filter((plan) => plan.period === 'yearly');
      const nextPurchaseTotalPrice = yearlyBillingSubscriptionPlans.reduce((acc, plan) => {
        return acc + calculateNextPurchasePriceFromSubscriptionPlan(plan);
      }, 0);
      return nextPurchaseTotalPrice;
    }
    default:
      assertUnreachable(period);
  }
}
