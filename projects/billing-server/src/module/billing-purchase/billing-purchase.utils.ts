import { BillingCurrency, BillingPeriod, BillingResultCode, BillingSubscriptionPlanData, ElapsedPlan, RemainingPlan, resultCode } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { calculateFlooredNow, createExpiredAt, NormalizedDateTime } from '../../date-time-utils';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { isMonthlySubscriptionExpiredOrNull, isYearlySubscriptionExpiredOrNull } from '../billing-organization/billing-organization.utils';

export function resolveCurrency(billingOrganizationCurrency: BillingCurrency | null, argumentCurrency: BillingCurrency): BillingCurrency {
  const currency = billingOrganizationCurrency ?? argumentCurrency;
  return currency;
}

export interface CalculateRemainingPlanOptions {
  foundInfo: BillingSubscriptionPlanInfo;
  dateTimes: PurchaseSubscriptionDateTimes;
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
  const { foundInfo, dateTimes } = options;
  const { period, originPrice, discountedAmount, category, type, option, currency } = foundInfo;
  const { totalDays, remainingDays } = dateTimes;
  const remainingDiscountedAmount = (originPrice * remainingDays) / totalDays - discountedAmount;
  if (remainingDiscountedAmount < 0) {
    return {
      ok: false,
      resultCode: resultCode('unexpected-error', {
        remainingDiscountedAmount,
      }),
    };
  }

  return {
    ok: true,
    remainingPlan: {
      category,
      type,
      option,
      period,
      currency,
      remainingDiscountedAmount,
      remainingDays,
    },
  };
}

export interface CalculateElapsedPlanOptions {
  data: BillingSubscriptionPlanData;
  discountedAmount: number;
  dateTimes: PurchaseSubscriptionDateTimes;
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
  const { data, discountedAmount, dateTimes } = options;
  const { originPrice, period, category, type, option, currency } = data;
  const { totalDays, elapsedDays } = dateTimes;
  const totalAmount = originPrice - discountedAmount;
  if (totalAmount < 0) {
    return {
      ok: false,
      resultCode: resultCode('unexpected-error', {
        totalAmount,
      }),
    };
  }

  const elapsedDiscountedAmount = (totalAmount * elapsedDays) / totalDays;
  return {
    ok: true,
    elapsedPlan: {
      category,
      type,
      option,
      period,
      currency,
      elapsedDiscountedAmount,
      elapsedDays,
    },
  };
}

export interface PurchaseSubscriptionDateTimes {
  notNormalizedStartedAt: Date;
  startedAt: NormalizedDateTime;
  expiredAt: NormalizedDateTime;
  totalDays: number;
  elapsedStartedAt: NormalizedDateTime;
  elapsedEndedAt: NormalizedDateTime;
  elapsedDays: number;
  remainingStartedAt: NormalizedDateTime;
  remainingEndedAt: NormalizedDateTime;
  remainingDays: number;
}

export interface CalculateYearlyPurchaseSubscriptionDateTimesOptions {
  billingOrganization: BillingOrganization;
  now: Date;
}

export interface CalculateYearlyPurchaseSubscriptionDateTimesResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculateYearlyPurchaseSubscriptionDateTimesResultSuccess extends PurchaseSubscriptionDateTimes {
  ok: true;
}

export type CalculateYearlyPurchaseSubscriptionDateTimesResult =
  | CalculateYearlyPurchaseSubscriptionDateTimesResultFailure
  | CalculateYearlyPurchaseSubscriptionDateTimesResultSuccess;

export function calculateYearlyPurchaseSubscriptionDateTimes(options: CalculateYearlyPurchaseSubscriptionDateTimesOptions): CalculateYearlyPurchaseSubscriptionDateTimesResult {
  const { billingOrganization, now } = options;
  if (isYearlySubscriptionExpiredOrNull(billingOrganization, now)) {
    const notNormalizedStartedAt = now;
    const startedAt = NormalizedDateTime.fromDate(notNormalizedStartedAt);
    const expiredAt = createExpiredAt(startedAt, 'yearly');
    const flooredNow = calculateFlooredNow(now, startedAt, expiredAt);
    const totalDays = expiredAt.dateTime.diff(startedAt.dateTime, 'days').days;
    const elapsedStartedAt = startedAt;
    const elapsedEndedAt = flooredNow;
    const elapsedDays = flooredNow.dateTime.diff(startedAt.dateTime, 'days').days;
    const remainingStartedAt = flooredNow;
    const remainingEndedAt = expiredAt;
    const remainingDays = expiredAt.dateTime.diff(flooredNow.dateTime, 'days').days;
    if (elapsedDays + remainingDays !== totalDays) {
      return {
        ok: false,
        resultCode: resultCode('unexpected-error', {
          elapsedDays,
          remainingDays,
          totalDays,
        }),
      };
    }

    return {
      ok: true,
      notNormalizedStartedAt,
      startedAt,
      expiredAt,
      totalDays,
      elapsedStartedAt,
      elapsedEndedAt,
      elapsedDays,
      remainingStartedAt,
      remainingEndedAt,
      remainingDays,
    };
  } else {
    if (billingOrganization.subscriptionYearlyStartedAt === null) {
      return {
        ok: false,
        resultCode: resultCode('organization-subscription-yearly-started-at-not-found', {
          billingOrganizationId: billingOrganization.billingOrganizationId,
        }),
      };
    }

    if (billingOrganization.subscriptionYearlyExpiredAt === null) {
      return {
        ok: false,
        resultCode: resultCode('organization-subscription-yearly-expired-at-not-found', {
          billingOrganizationId: billingOrganization.billingOrganizationId,
        }),
      };
    }

    const notNormalizedStartedAt = billingOrganization.subscriptionYearlyStartedAt;
    const startedAt = NormalizedDateTime.fromDate(notNormalizedStartedAt);
    const calculatedExpiredAt = createExpiredAt(startedAt, 'yearly');
    const expiredAt = NormalizedDateTime.fromDate(billingOrganization.subscriptionYearlyExpiredAt);
    if (expiredAt.date.getTime() !== calculatedExpiredAt.date.getTime()) {
      return {
        ok: false,
        resultCode: resultCode('organization-subscription-yearly-invalid-value', {
          expiredAt: expiredAt.date.toISOString(),
          calculatedExpiredAt: calculatedExpiredAt.date.toISOString(),
        }),
      };
    }

    if (startedAt.date.getTime() > expiredAt.date.getTime()) {
      return {
        ok: false,
        resultCode: resultCode('organization-subscription-yearly-invalid-value', {
          startedAt: startedAt.date.toISOString(),
          expiredAt: expiredAt.date.toISOString(),
        }),
      };
    }

    const flooredNow = calculateFlooredNow(now, startedAt, expiredAt);
    const totalDays = expiredAt.dateTime.diff(startedAt.dateTime, 'days').days;
    const elapsedStartedAt = startedAt;
    const elapsedEndedAt = flooredNow;
    const elapsedDays = flooredNow.dateTime.diff(startedAt.dateTime, 'days').days;
    const remainingStartedAt = flooredNow;
    const remainingEndedAt = expiredAt;
    const remainingDays = expiredAt.dateTime.diff(flooredNow.dateTime, 'days').days;
    if (elapsedDays + remainingDays !== totalDays) {
      return {
        ok: false,
        resultCode: resultCode('unexpected-error', {
          elapsedDays,
          remainingDays,
          totalDays,
        }),
      };
    }

    return {
      ok: true,
      notNormalizedStartedAt,
      startedAt,
      expiredAt,
      totalDays,
      elapsedStartedAt,
      elapsedEndedAt,
      elapsedDays,
      remainingStartedAt,
      remainingEndedAt,
      remainingDays,
    };
  }
}

export interface CalculateMonthlyPurchaseSubscriptionDateTimesOptions {
  billingOrganization: BillingOrganization;
  now: Date;
}

export interface CalculateMonthlyPurchaseSubscriptionDateTimesResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculateMonthlyPurchaseSubscriptionDateTimesResultSuccess extends PurchaseSubscriptionDateTimes {
  ok: true;
}

export type CalculateMonthlyPurchaseSubscriptionDateTimesResult =
  | CalculateMonthlyPurchaseSubscriptionDateTimesResultFailure
  | CalculateMonthlyPurchaseSubscriptionDateTimesResultSuccess;

export function calculateMonthlyPurchaseSubscriptionDateTimes(options: CalculateMonthlyPurchaseSubscriptionDateTimesOptions): CalculateMonthlyPurchaseSubscriptionDateTimesResult {
  const { billingOrganization, now } = options;
  if (isMonthlySubscriptionExpiredOrNull(billingOrganization, now)) {
    const notNormalizedStartedAt = now;
    const startedAt = NormalizedDateTime.fromDate(notNormalizedStartedAt);
    const expiredAt = createExpiredAt(startedAt, 'monthly');
    const flooredNow = calculateFlooredNow(now, startedAt, expiredAt);
    const totalDays = expiredAt.dateTime.diff(startedAt.dateTime, 'days').days;
    const elapsedStartedAt = startedAt;
    const elapsedEndedAt = flooredNow;
    const elapsedDays = flooredNow.dateTime.diff(startedAt.dateTime, 'days').days;
    const remainingStartedAt = flooredNow;
    const remainingEndedAt = expiredAt;
    const remainingDays = expiredAt.dateTime.diff(flooredNow.dateTime, 'days').days;
    if (elapsedDays + remainingDays !== totalDays) {
      return {
        ok: false,
        resultCode: resultCode('unexpected-error', {
          elapsedDays,
          remainingDays,
          totalDays,
        }),
      };
    }

    return {
      ok: true,
      notNormalizedStartedAt,
      startedAt,
      expiredAt,
      totalDays,
      elapsedStartedAt,
      elapsedEndedAt,
      elapsedDays,
      remainingStartedAt,
      remainingEndedAt,
      remainingDays,
    };
  } else {
    if (billingOrganization.subscriptionMonthlyStartedAt === null) {
      return {
        ok: false,
        resultCode: resultCode('organization-subscription-monthly-started-at-not-found', {
          billingOrganizationId: billingOrganization.billingOrganizationId,
        }),
      };
    }

    if (billingOrganization.subscriptionMonthlyExpiredAt === null) {
      return {
        ok: false,
        resultCode: resultCode('organization-subscription-monthly-expired-at-not-found', {
          billingOrganizationId: billingOrganization.billingOrganizationId,
        }),
      };
    }

    const notNormalizedStartedAt = billingOrganization.subscriptionMonthlyStartedAt;
    const startedAt = NormalizedDateTime.fromDate(notNormalizedStartedAt);
    const expiredAtCalculated = createExpiredAt(startedAt, 'monthly');
    const expiredAt = NormalizedDateTime.fromDate(billingOrganization.subscriptionMonthlyExpiredAt);
    if (expiredAt.date.getTime() !== expiredAtCalculated.date.getTime()) {
      return {
        ok: false,
        resultCode: resultCode('organization-subscription-monthly-invalid-value', {
          expiredAt: expiredAt.date.toISOString(),
          calculatedExpiredAt: expiredAtCalculated.date.toISOString(),
        }),
      };
    }

    if (startedAt.date.getTime() > expiredAt.date.getTime()) {
      return {
        ok: false,
        resultCode: resultCode('organization-subscription-monthly-invalid-value', {
          startedAt: startedAt.date.toISOString(),
          expiredAt: expiredAt.date.toISOString(),
        }),
      };
    }

    const flooredNow = calculateFlooredNow(now, startedAt, expiredAt);
    const totalDays = expiredAt.dateTime.diff(startedAt.dateTime, 'days').days;
    const elapsedStartedAt = startedAt;
    const elapsedEndedAt = flooredNow;
    const elapsedDays = flooredNow.dateTime.diff(startedAt.dateTime, 'days').days;
    const remainingStartedAt = flooredNow;
    const remainingEndedAt = expiredAt;
    const remainingDays = expiredAt.dateTime.diff(flooredNow.dateTime, 'days').days;
    if (elapsedDays + remainingDays !== totalDays) {
      return {
        ok: false,
        resultCode: resultCode('unexpected-error', {
          elapsedDays,
          remainingDays,
          totalDays,
        }),
      };
    }

    return {
      ok: true,
      notNormalizedStartedAt,
      startedAt,
      expiredAt,
      totalDays,
      elapsedStartedAt,
      elapsedEndedAt,
      elapsedDays,
      remainingStartedAt,
      remainingEndedAt,
      remainingDays,
    };
  }
}

export interface CalculatePurchaseSubscriptionDateTimesOptions {
  billingOrganization: BillingOrganization;
  now: Date;
}

export interface CalculatePurchaseSubscriptionDateTimesResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculatePurchaseSubscriptionDateTimesResultSuccess {
  ok: true;
  yearlyDateTimes: CalculateYearlyPurchaseSubscriptionDateTimesResultSuccess;
  monthlyDateTimes: CalculateMonthlyPurchaseSubscriptionDateTimesResultSuccess;
}

export type CalculatePurchaseSubscriptionDateTimesResult = CalculatePurchaseSubscriptionDateTimesResultFailure | CalculatePurchaseSubscriptionDateTimesResultSuccess;

export function calculatePurchaseSubscriptionDateTimes(options: CalculatePurchaseSubscriptionDateTimesOptions): CalculatePurchaseSubscriptionDateTimesResult {
  const { billingOrganization, now } = options;
  const yearlyResult = calculateYearlyPurchaseSubscriptionDateTimes({ billingOrganization, now });
  if (!yearlyResult.ok) {
    return {
      ok: false,
      resultCode: yearlyResult.resultCode,
    };
  }

  const monthlyResult = calculateMonthlyPurchaseSubscriptionDateTimes({ billingOrganization, now });
  if (!monthlyResult.ok) {
    return {
      ok: false,
      resultCode: monthlyResult.resultCode,
    };
  }

  return {
    ok: true,
    yearlyDateTimes: yearlyResult,
    monthlyDateTimes: monthlyResult,
  };
}

export function getPurchaseSubscriptionDateTimes(dateTimes: CalculatePurchaseSubscriptionDateTimesResultSuccess, period: BillingPeriod): PurchaseSubscriptionDateTimes {
  switch (period) {
    case 'monthly': {
      return dateTimes.monthlyDateTimes;
    }
    case 'yearly': {
      return dateTimes.yearlyDateTimes;
    }
    default: {
      assertUnreachable(period);
    }
  }
}
