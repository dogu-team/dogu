import { BillingCurrency, BillingPeriod, BillingResultCode, BillingSubscriptionPlanData, ElapsedPlan, RemainingPlan, resultCode } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { DateTime } from 'luxon';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';

export function resolveCurrency(billingOrganization: BillingOrganization, argumentCurrency: BillingCurrency): BillingCurrency {
  const currency = billingOrganization.currency ?? argumentCurrency;
  return currency;
}

export function toDateTime(date: Date): DateTime {
  return DateTime.fromJSDate(date);
}

export function toDate(date: DateTime): Date {
  return date.toJSDate();
}

export function floorDays(dateTime: DateTime): DateTime {
  return dateTime.startOf('day');
}

export function ceilDays(dateTime: DateTime): DateTime {
  return floorDays(dateTime).plus({ days: 1 });
}

export function createStartedAt(now: Date): Date {
  return toDate(ceilDays(toDateTime(now)));
}

export function createExpiredAt(startedAt: Date, period: BillingPeriod): Date {
  switch (period) {
    case 'monthly': {
      return toDate(toDateTime(startedAt).plus({ months: 1 }));
    }
    case 'yearly': {
      return toDate(toDateTime(startedAt).plus({ years: 1 }));
    }
    default: {
      assertUnreachable(period);
    }
  }
}

export interface CalculateRemaningDiscountOptions {
  originPrice: number;
  discountedAmount: number;
  startedAt: Date;
  expiredAt: Date;
  now: Date;
}

export interface CalculateRemaningDiscountResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculateRemaningDiscountResultSuccess {
  ok: true;
  totalDays: number;
  remainingDays: number;
  remainingDiscountedAmount: number;
}

export type CalculateRemaningDiscountResult = CalculateRemaningDiscountResultFailure | CalculateRemaningDiscountResultSuccess;

export function calculateRemaningDiscount(options: CalculateRemaningDiscountOptions): CalculateRemaningDiscountResult {
  const { originPrice, discountedAmount } = options;
  const startedAt = toDateTime(options.startedAt);
  const expiredAt = toDateTime(options.expiredAt);
  const now = toDateTime(options.now);
  const totalDays = expiredAt.diff(startedAt, 'days').days;
  if (totalDays === 0) {
    return {
      ok: false,
      resultCode: resultCode('division-by-zero'),
    };
  }

  const remainingDays = expiredAt.diff(now, 'days').days;
  const remainingDiscountedAmount = (originPrice * remainingDays) / totalDays - discountedAmount;
  if (remainingDiscountedAmount < 0) {
    return {
      ok: false,
      resultCode: resultCode('unexpected-error'),
    };
  }

  return {
    ok: true,
    totalDays,
    remainingDays,
    remainingDiscountedAmount,
  };
}

export interface CalculateElapsedDiscountOptions {
  originPrice: number;
  discountedAmount: number;
  startedAt: Date;
  expiredAt: Date;
  now: Date;
}

export interface CalculateElapsedDiscountResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculateElapsedDiscountResultSuccess {
  ok: true;
  totalDays: number;
  elapsedDays: number;
  elapsedDiscountedAmount: number;
}

export type CalculateElapsedDiscountResult = CalculateElapsedDiscountResultFailure | CalculateElapsedDiscountResultSuccess;

export function calculateElapsedDiscount(options: CalculateElapsedDiscountOptions): CalculateElapsedDiscountResult {
  const { originPrice, discountedAmount } = options;
  const startedAt = toDateTime(options.startedAt);
  const expiredAt = toDateTime(options.expiredAt);
  const now = toDateTime(options.now);
  const totalDays = expiredAt.diff(startedAt, 'days').days;
  if (totalDays === 0) {
    return {
      ok: false,
      resultCode: resultCode('division-by-zero'),
    };
  }

  const elapsedDays = now.diff(startedAt, 'days').days;
  const totalAmount = originPrice - discountedAmount;
  if (totalAmount < 0) {
    return {
      ok: false,
      resultCode: resultCode('unexpected-error'),
    };
  }

  const elapsedDiscountedAmount = (totalAmount * elapsedDays) / totalDays;
  return {
    ok: true,
    totalDays,
    elapsedDays,
    elapsedDiscountedAmount,
  };
}

export interface CalculateLocalNextPurchaseDateOptions {
  billingOrganization: BillingOrganization;
  period: BillingPeriod;
}

export function calculateNextPurchaseDate(options: CalculateLocalNextPurchaseDateOptions): Date {
  const { billingOrganization, period } = options;
  switch (period) {
    case 'monthly': {
      const { monthlyStartedAt } = billingOrganization;
      if (monthlyStartedAt === null) {
        return toDate(ceilDays(toDateTime(new Date())).plus({ months: 1 }).minus({ days: 1 }));
      } else {
        return toDate(toDateTime(monthlyStartedAt).plus({ months: 1 }).minus({ days: 1 }));
      }
    }
    case 'yearly': {
      const { yearlyStartedAt } = billingOrganization;
      if (yearlyStartedAt === null) {
        return toDate(ceilDays(toDateTime(new Date())).plus({ years: 1 }).minus({ days: 1 }));
      } else {
        return toDate(toDateTime(yearlyStartedAt).plus({ years: 1 }).minus({ days: 1 }));
      }
    }
    default:
      assertUnreachable(period);
  }
}

export interface CalculateRemainingPlanOptions {
  billingOrganization: BillingOrganization;
  foundBillingSubscriptionPlanInfo: BillingSubscriptionPlanInfo;
  now: Date;
}

export interface CalculateRemainingPlanResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculateRemainingPlanResultSuccess {
  ok: true;
  remainingPlan: RemainingPlan;
}

export type CalculateRemainingPlanResult = CalculateRemainingPlanResultFailure | CalculateRemainingPlanResultSuccess;

export function calculateRemainingPlan(options: CalculateRemainingPlanOptions): CalculateRemainingPlanResult {
  const { billingOrganization, foundBillingSubscriptionPlanInfo } = options;
  switch (foundBillingSubscriptionPlanInfo.period) {
    case 'monthly':
      {
        if (billingOrganization.monthlyStartedAt === null) {
          return {
            ok: false,
            resultCode: resultCode('organization-monthly-started-at-not-found'),
          };
        }

        if (billingOrganization.monthlyExpiredAt === null) {
          return {
            ok: false,
            resultCode: resultCode('organization-monthly-expired-at-not-found'),
          };
        }

        const calculateRefundResult = calculateRemaningDiscount({
          originPrice: foundBillingSubscriptionPlanInfo.originPrice,
          discountedAmount: foundBillingSubscriptionPlanInfo.discountedAmount,
          startedAt: billingOrganization.monthlyStartedAt,
          expiredAt: billingOrganization.monthlyExpiredAt,
          now: options.now,
        });

        if (!calculateRefundResult.ok) {
          return {
            ok: false,
            resultCode: calculateRefundResult.resultCode,
          };
        }

        const { remainingDiscountedAmount } = calculateRefundResult;
        const remainingPlan: RemainingPlan = {
          category: foundBillingSubscriptionPlanInfo.category,
          type: foundBillingSubscriptionPlanInfo.type,
          option: foundBillingSubscriptionPlanInfo.option,
          period: foundBillingSubscriptionPlanInfo.period,
          currency: foundBillingSubscriptionPlanInfo.currency,
          remainingDiscountedAmount: remainingDiscountedAmount,
          remainingDays: calculateRefundResult.remainingDays,
        };
        return {
          ok: true,
          remainingPlan,
        };
      }
      break;
    case 'yearly':
      {
        if (billingOrganization.yearlyStartedAt === null) {
          return {
            ok: false,
            resultCode: resultCode('organization-yearly-started-at-not-found'),
          };
        }

        if (billingOrganization.yearlyExpiredAt === null) {
          return {
            ok: false,
            resultCode: resultCode('organization-yearly-expired-at-not-found'),
          };
        }

        const calculateRefundResult = calculateRemaningDiscount({
          originPrice: foundBillingSubscriptionPlanInfo.originPrice,
          discountedAmount: foundBillingSubscriptionPlanInfo.discountedAmount,
          startedAt: billingOrganization.yearlyStartedAt,
          expiredAt: billingOrganization.yearlyExpiredAt,
          now: options.now,
        });

        if (!calculateRefundResult.ok) {
          return {
            ok: false,
            resultCode: calculateRefundResult.resultCode,
          };
        }

        const { remainingDiscountedAmount } = calculateRefundResult;
        const remainingPlan: RemainingPlan = {
          category: foundBillingSubscriptionPlanInfo.category,
          type: foundBillingSubscriptionPlanInfo.type,
          option: foundBillingSubscriptionPlanInfo.option,
          period: foundBillingSubscriptionPlanInfo.period,
          currency: foundBillingSubscriptionPlanInfo.currency,
          remainingDiscountedAmount: remainingDiscountedAmount,
          remainingDays: calculateRefundResult.remainingDays,
        };
        return {
          ok: true,
          remainingPlan,
        };
      }
      break;
    default: {
      assertUnreachable(foundBillingSubscriptionPlanInfo.period);
    }
  }
}

export interface CalculateElapsedPlanOptions {
  billingOrganization: BillingOrganization;
  billingSubscriptionPlanData: BillingSubscriptionPlanData;
  discountedAmount: number;
  now: Date;
}

export interface CalculateElapsedPlanResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculateElapsedPlanResultSuccess {
  ok: true;
  elapsedPlan: ElapsedPlan;
}

export type CalculateElapsedPlanResult = CalculateElapsedPlanResultFailure | CalculateElapsedPlanResultSuccess;

export function calculateElapsedPlan(options: CalculateElapsedPlanOptions): CalculateElapsedPlanResult {
  const { billingOrganization, billingSubscriptionPlanData, discountedAmount } = options;
  const { period } = billingSubscriptionPlanData;
  switch (period) {
    case 'monthly': {
      const monthlyStartedAt = billingOrganization.monthlyStartedAt ?? createStartedAt(options.now);
      const monthlyExpiredAt = billingOrganization.monthlyExpiredAt ?? createExpiredAt(monthlyStartedAt, 'monthly');
      const calculateElapsedDiscountResult = calculateElapsedDiscount({
        originPrice: billingSubscriptionPlanData.originPrice,
        discountedAmount,
        startedAt: monthlyStartedAt,
        expiredAt: monthlyExpiredAt,
        now: options.now,
      });

      if (!calculateElapsedDiscountResult.ok) {
        return {
          ok: false,
          resultCode: calculateElapsedDiscountResult.resultCode,
        };
      }

      const { elapsedDiscountedAmount } = calculateElapsedDiscountResult;
      const elapsedPlan: ElapsedPlan = {
        category: billingSubscriptionPlanData.category,
        type: billingSubscriptionPlanData.type,
        option: billingSubscriptionPlanData.option,
        period: billingSubscriptionPlanData.period,
        currency: billingSubscriptionPlanData.currency,
        elapsedDiscountedAmount: elapsedDiscountedAmount,
        elapsedDays: calculateElapsedDiscountResult.elapsedDays,
      };
      return {
        ok: true,
        elapsedPlan,
      };
    }
    case 'yearly': {
      const yearlyStartedAt = billingOrganization.yearlyStartedAt ?? createStartedAt(options.now);
      const yearlyExpiredAt = billingOrganization.yearlyExpiredAt ?? createExpiredAt(yearlyStartedAt, 'yearly');
      const calculateElapsedDiscountResult = calculateElapsedDiscount({
        originPrice: billingSubscriptionPlanData.originPrice,
        discountedAmount,
        startedAt: yearlyStartedAt,
        expiredAt: yearlyExpiredAt,
        now: options.now,
      });
      if (!calculateElapsedDiscountResult.ok) {
        return {
          ok: false,
          resultCode: calculateElapsedDiscountResult.resultCode,
        };
      }

      const { elapsedDiscountedAmount } = calculateElapsedDiscountResult;
      const elapsedPlan: ElapsedPlan = {
        category: billingSubscriptionPlanData.category,
        type: billingSubscriptionPlanData.type,
        option: billingSubscriptionPlanData.option,
        period: billingSubscriptionPlanData.period,
        currency: billingSubscriptionPlanData.currency,
        elapsedDiscountedAmount: elapsedDiscountedAmount,
        elapsedDays: calculateElapsedDiscountResult.elapsedDays,
      };
      return {
        ok: true,
        elapsedPlan,
      };
    }
    default: {
      assertUnreachable(period);
    }
  }
}
