import { BillingCurrency, BillingPeriod, BillingResultCode, BillingSubscriptionPlanData, ElapsedPlan, RemainingPlan, resultCode } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { DateTime } from 'luxon';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';

export function resolveCurrency(billingOrganizationCurrency: BillingCurrency | null, argumentCurrency: BillingCurrency): BillingCurrency {
  const currency = billingOrganizationCurrency ?? argumentCurrency;
  return currency;
}

export class NormalizedDateTime {
  static from(normalizedDateTime: NormalizedDateTime): NormalizedDateTime {
    return new NormalizedDateTime(normalizedDateTime.dateTime);
  }

  static fromNow(): NormalizedDateTime {
    const now = DateTime.fromJSDate(new Date());
    const ceiledNowDateTime = NormalizedDateTime.ceilHours(now);
    return new NormalizedDateTime(ceiledNowDateTime);
  }

  static fromDate(date: Date): NormalizedDateTime {
    const dateTime = DateTime.fromJSDate(date);
    const ceiledDateTime = NormalizedDateTime.ceilHours(dateTime);
    return new NormalizedDateTime(ceiledDateTime);
  }

  static fromDateTime(dateTime: DateTime): NormalizedDateTime {
    const ceiledDateTime = NormalizedDateTime.ceilHours(dateTime);
    return new NormalizedDateTime(ceiledDateTime);
  }

  private static ceilHours(dateTime: DateTime): DateTime {
    const ceiled = dateTime.minute === 0 && dateTime.second === 0 && dateTime.millisecond === 0;
    if (ceiled) {
      return dateTime;
    }

    return dateTime.startOf('hour').plus({ hours: 1 });
  }

  constructor(readonly dateTime: DateTime) {}

  get date(): Date {
    return this.dateTime.toJSDate();
  }
}

export function createStartedAt(now: NormalizedDateTime): NormalizedDateTime {
  return now;
}

export function createExpiredAt(startedAt: NormalizedDateTime, period: BillingPeriod): NormalizedDateTime {
  switch (period) {
    case 'monthly': {
      const expiredAt = startedAt.dateTime.plus({ months: 1 });
      return NormalizedDateTime.fromDateTime(expiredAt);
    }
    case 'yearly': {
      const expiredAt = startedAt.dateTime.plus({ years: 1 });
      return NormalizedDateTime.fromDateTime(expiredAt);
    }
    default: {
      assertUnreachable(period);
    }
  }
}

export interface CalculateRemaningDiscountOptions {
  originPrice: number;
  discountedAmount: number;
  startedAt: NormalizedDateTime;
  expiredAt: NormalizedDateTime;
  now: NormalizedDateTime;
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
  const { originPrice, discountedAmount, startedAt, expiredAt } = options;
  if (startedAt.date > expiredAt.date) {
    return {
      ok: false,
      resultCode: resultCode('unexpected-error'),
    };
  }

  const startedAtDateTime = startedAt.dateTime;
  const expiredAtDateTime = expiredAt.dateTime;
  const totalDays = expiredAtDateTime.diff(startedAtDateTime, 'days').days;
  if (totalDays === 0) {
    return {
      ok: false,
      resultCode: resultCode('division-by-zero'),
    };
  }

  let now = options.now;
  if (now.date > expiredAt.date) {
    now = expiredAt;
  } else if (now < startedAt) {
    now = startedAt;
  }

  const remainingDays = expiredAt.dateTime.diff(now.dateTime, 'days').days;
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
  startedAt: NormalizedDateTime;
  expiredAt: NormalizedDateTime;
  now: NormalizedDateTime;
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
  const { originPrice, discountedAmount, startedAt, expiredAt } = options;
  if (startedAt.date > expiredAt.date) {
    return {
      ok: false,
      resultCode: resultCode('unexpected-error'),
    };
  }

  const totalDays = expiredAt.dateTime.diff(startedAt.dateTime, 'days').days;
  if (totalDays === 0) {
    return {
      ok: false,
      resultCode: resultCode('division-by-zero'),
    };
  }

  let now = options.now;
  if (now > expiredAt) {
    now = expiredAt;
  } else if (now < startedAt) {
    now = startedAt;
  }

  const elapsedDays = now.dateTime.diff(startedAt.dateTime, 'days').days;
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

export interface CalculateRemainingPlanOptions {
  billingOrganization: BillingOrganization;
  foundBillingSubscriptionPlanInfo: BillingSubscriptionPlanInfo;
  now: NormalizedDateTime;
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
          startedAt: NormalizedDateTime.fromDate(billingOrganization.monthlyStartedAt),
          expiredAt: NormalizedDateTime.fromDate(billingOrganization.monthlyExpiredAt),
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
          startedAt: NormalizedDateTime.fromDate(billingOrganization.yearlyStartedAt),
          expiredAt: NormalizedDateTime.fromDate(billingOrganization.yearlyExpiredAt),
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
  now: NormalizedDateTime;
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
      const monthlyStartedAt = billingOrganization.monthlyStartedAt ? NormalizedDateTime.fromDate(billingOrganization.monthlyStartedAt) : createStartedAt(options.now);
      const monthlyExpiredAt = billingOrganization.monthlyExpiredAt
        ? NormalizedDateTime.fromDate(billingOrganization.monthlyExpiredAt)
        : createExpiredAt(monthlyStartedAt, 'monthly');
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
      const yearlyStartedAt = billingOrganization.yearlyStartedAt ? NormalizedDateTime.fromDate(billingOrganization.yearlyStartedAt) : createStartedAt(options.now);
      const yearlyExpiredAt = billingOrganization.yearlyExpiredAt ? NormalizedDateTime.fromDate(billingOrganization.yearlyExpiredAt) : createExpiredAt(yearlyStartedAt, 'yearly');
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
