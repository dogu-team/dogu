import { BillingCurrency, BillingPeriod, BillingResultCode, BillingSubscriptionPlanData, ElapsedPlan, RemainingPlan, resultCode } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { DateTime } from 'luxon';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';

export function resolveCurrency(organization: BillingOrganization, argumentCurrency: BillingCurrency): BillingCurrency {
  const currency = organization.currency ?? argumentCurrency;
  return currency;
}

export function resolveTimezoneOffset(organization: BillingOrganization, argumentTimezoneOffset: string): string {
  const timezoneOffset = organization.timezoneOffset ?? argumentTimezoneOffset;
  return timezoneOffset;
}

export interface TimezoneOffset {
  sign: '+' | '-';
  hours: number;
  minutes: number;
}

const timezoneOffsetPattern = /^(?<sign>[+-])(?<hours>\d{2}):(?<minutes>\d{2})$/;

export interface ParseTimezoneOffsetResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface ParseTimezoneOffsetResultSuccess {
  ok: true;
  timezoneOffset: TimezoneOffset;
}

export type ParseTimezoneOffsetResult = ParseTimezoneOffsetResultFailure | ParseTimezoneOffsetResultSuccess;

export function parseTimezoneOffset(timezoneOffsetString: string): ParseTimezoneOffsetResult {
  const match = timezoneOffsetString.match(timezoneOffsetPattern);
  if (!match) {
    return {
      ok: false,
      resultCode: resultCode('timezone-offset-not-matched'),
    };
  }

  const { sign, hours, minutes } = (match.groups ?? {}) as { sign?: string; hours?: string; minutes?: string };
  if (sign === undefined) {
    return {
      ok: false,
      resultCode: resultCode('timezone-offset-sign-not-matched'),
    };
  }

  if (hours === undefined) {
    return {
      ok: false,
      resultCode: resultCode('timezone-offset-hours-not-matched'),
    };
  }

  if (minutes === undefined) {
    return {
      ok: false,
      resultCode: resultCode('timezone-offset-minutes-not-matched'),
    };
  }

  const hoursNumber = parseInt(hours, 10);
  if (Number.isNaN(hoursNumber)) {
    return {
      ok: false,
      resultCode: resultCode('timezone-offset-hours-not-number'),
    };
  }

  if (hoursNumber < 0 || hoursNumber > 23) {
    return {
      ok: false,
      resultCode: resultCode('timezone-offset-hours-range-not-matched'),
    };
  }

  const minutesNumber = parseInt(minutes, 10);
  if (Number.isNaN(minutesNumber)) {
    return {
      ok: false,
      resultCode: resultCode('timezone-offset-minutes-not-number'),
    };
  }

  if (minutesNumber < 0 || minutesNumber > 59) {
    return {
      ok: false,
      resultCode: resultCode('timezone-offset-minutes-range-not-matched'),
    };
  }

  const timezoneOffset: TimezoneOffset = {
    sign: sign as '+' | '-',
    hours: hoursNumber,
    minutes: minutesNumber,
  };

  return {
    ok: true,
    timezoneOffset,
  };
}

export function toDateTime(date: Date): DateTime {
  return DateTime.fromJSDate(date);
}

export function toDate(date: DateTime): Date {
  return date.toJSDate();
}

export function applyTimezone(dateTime: DateTime, timezoneOffset: TimezoneOffset): DateTime {
  const { sign, hours, minutes } = timezoneOffset;
  return sign === '+' ? dateTime.plus({ hours, minutes }) : dateTime.minus({ hours, minutes });
}

export function removeTimezone(dateTime: DateTime, timezoneOffset: TimezoneOffset): DateTime {
  const { sign, hours, minutes } = timezoneOffset;
  return sign === '+' ? dateTime.minus({ hours, minutes }) : dateTime.plus({ hours, minutes });
}

export function floorDays(dateTime: DateTime): DateTime {
  return dateTime.startOf('day');
}

export function ceilDays(dateTime: DateTime): DateTime {
  return floorDays(dateTime).plus({ days: 1 });
}

export function createCalculationStartedAtFromNow(timezoneOffset: TimezoneOffset): Date {
  return toDate(removeTimezone(ceilDays(applyTimezone(toDateTime(new Date()), timezoneOffset)), timezoneOffset));
}

export function createCalculationExpiredAt(calculationStartedAt: Date, period: BillingPeriod): Date {
  switch (period) {
    case 'monthly': {
      return toDate(toDateTime(calculationStartedAt).plus({ months: 1 }));
    }
    case 'yearly': {
      return toDate(toDateTime(calculationStartedAt).plus({ years: 1 }));
    }
    default: {
      assertUnreachable(period);
    }
  }
}

export interface RefundOptions {
  originPrice: number;
  discountedAmount: number;
  calculationStartedAt: Date;
  calculationExpiredAt: Date;
  timezoneOffset: TimezoneOffset;
}

export interface CalculateRefundResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculateRefundResultSuccess {
  ok: true;
  totalDays: number;
  remainingDays: number;
  refundAmount: number;
}

export type CalculateRefundResult = CalculateRefundResultFailure | CalculateRefundResultSuccess;

export function calculateRefund(options: RefundOptions): CalculateRefundResult {
  const { originPrice, discountedAmount, calculationStartedAt, calculationExpiredAt, timezoneOffset } = options;
  const calculationStartedAtDateTime = applyTimezone(toDateTime(calculationStartedAt), timezoneOffset);
  const calculationExpiredAtDateTime = applyTimezone(toDateTime(calculationExpiredAt), timezoneOffset);
  const nowDateTime = floorDays(applyTimezone(toDateTime(new Date()), timezoneOffset));
  const totalDays = calculationExpiredAtDateTime.diff(calculationStartedAtDateTime, 'days').days;
  if (totalDays === 0) {
    return {
      ok: false,
      resultCode: resultCode('division-by-zero'),
    };
  }

  const remainingDays = calculationExpiredAtDateTime.diff(nowDateTime, 'days').days;
  const refundAmount = (originPrice * remainingDays) / totalDays - discountedAmount;
  if (refundAmount < 0) {
    return {
      ok: false,
      resultCode: resultCode('unexpected-error'),
    };
  }

  return {
    ok: true,
    totalDays,
    remainingDays,
    refundAmount,
  };
}

export interface CalculateElapsedDiscountOptions {
  originPrice: number;
  discountedAmount: number;
  calculationStartedAt: Date;
  calculationExpiredAt: Date;
  timezoneOffset: TimezoneOffset;
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
  const { originPrice, discountedAmount, calculationStartedAt, calculationExpiredAt, timezoneOffset } = options;
  const calculationStartedAtDateTime = applyTimezone(toDateTime(calculationStartedAt), timezoneOffset);
  const calculationExpiredAtDateTime = applyTimezone(toDateTime(calculationExpiredAt), timezoneOffset);
  const nowDateTime = ceilDays(applyTimezone(toDateTime(new Date()), timezoneOffset));
  const totalDays = calculationExpiredAtDateTime.diff(calculationStartedAtDateTime, 'days').days;
  if (totalDays === 0) {
    return {
      ok: false,
      resultCode: resultCode('division-by-zero'),
    };
  }

  const elapsedDays = nowDateTime.diff(calculationStartedAtDateTime, 'days').days;
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
  organization: BillingOrganization;
  period: BillingPeriod;
  timezoneOffset: TimezoneOffset;
}

export function calculateLocalNextPurchaseDate(options: CalculateLocalNextPurchaseDateOptions): Date {
  const { organization, period, timezoneOffset } = options;
  switch (period) {
    case 'monthly': {
      const { monthlyCalculationStartedAt } = organization;
      if (monthlyCalculationStartedAt === null) {
        return toDate(
          ceilDays(applyTimezone(toDateTime(new Date()), timezoneOffset))
            .plus({ months: 1 })
            .minus({ days: 1 }),
        );
      } else {
        return toDate(applyTimezone(toDateTime(monthlyCalculationStartedAt), timezoneOffset).plus({ months: 1 }).minus({ days: 1 }));
      }
    }
    case 'yearly': {
      const { yearlyCalculationStartedAt } = organization;
      if (yearlyCalculationStartedAt === null) {
        return toDate(
          ceilDays(applyTimezone(toDateTime(new Date()), timezoneOffset))
            .plus({ years: 1 })
            .minus({ days: 1 }),
        );
      } else {
        return toDate(applyTimezone(toDateTime(yearlyCalculationStartedAt), timezoneOffset).plus({ years: 1 }).minus({ days: 1 }));
      }
    }
    default:
      assertUnreachable(period);
  }
}

export interface CalculateRemainingPlanOptions {
  organization: BillingOrganization;
  foundSubscriptionPlanInfo: BillingSubscriptionPlanInfo;
  period: BillingPeriod;
  timezoneOffset: TimezoneOffset;
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
  const { organization, foundSubscriptionPlanInfo, period, timezoneOffset } = options;
  switch (period) {
    case 'monthly': {
      if (organization.monthlyCalculationStartedAt === null) {
        return {
          ok: false,
          resultCode: resultCode('organization-monthly-calculation-started-at-not-found'),
        };
      }

      if (organization.monthlyCalculationExpiredAt === null) {
        return {
          ok: false,
          resultCode: resultCode('organization-monthly-calculation-expired-at-not-found'),
        };
      }

      const calculateRefundResult = calculateRefund({
        originPrice: foundSubscriptionPlanInfo.originPrice,
        discountedAmount: foundSubscriptionPlanInfo.discountedAmount,
        calculationStartedAt: organization.monthlyCalculationStartedAt,
        calculationExpiredAt: organization.monthlyCalculationExpiredAt,
        timezoneOffset,
      });

      if (!calculateRefundResult.ok) {
        return {
          ok: false,
          resultCode: calculateRefundResult.resultCode,
        };
      }

      const { refundAmount } = calculateRefundResult;
      const remainingPlan: RemainingPlan = {
        category: foundSubscriptionPlanInfo.category,
        type: foundSubscriptionPlanInfo.type,
        option: foundSubscriptionPlanInfo.option,
        period: foundSubscriptionPlanInfo.period,
        currency: foundSubscriptionPlanInfo.currency,
        amount: refundAmount,
        remaningDays: calculateRefundResult.remainingDays,
      };
      return {
        ok: true,
        remainingPlan,
      };
    }
    case 'yearly': {
      if (organization.yearlyCalculationStartedAt === null) {
        return {
          ok: false,
          resultCode: resultCode('organization-yearly-calculation-started-at-not-found'),
        };
      }

      if (organization.yearlyCalculationExpiredAt === null) {
        return {
          ok: false,
          resultCode: resultCode('organization-yearly-calculation-expired-at-not-found'),
        };
      }

      const calculateRefundResult = calculateRefund({
        originPrice: foundSubscriptionPlanInfo.originPrice,
        discountedAmount: foundSubscriptionPlanInfo.discountedAmount,
        calculationStartedAt: organization.yearlyCalculationStartedAt,
        calculationExpiredAt: organization.yearlyCalculationExpiredAt,
        timezoneOffset,
      });

      if (!calculateRefundResult.ok) {
        return {
          ok: false,
          resultCode: calculateRefundResult.resultCode,
        };
      }

      const { refundAmount } = calculateRefundResult;
      const remainingPlan: RemainingPlan = {
        category: foundSubscriptionPlanInfo.category,
        type: foundSubscriptionPlanInfo.type,
        option: foundSubscriptionPlanInfo.option,
        period: foundSubscriptionPlanInfo.period,
        currency: foundSubscriptionPlanInfo.currency,
        amount: refundAmount,
        remaningDays: calculateRefundResult.remainingDays,
      };
      return {
        ok: true,
        remainingPlan,
      };
    }
    default: {
      assertUnreachable(period);
    }
  }
}

export interface CalculateElapsedPlanOptions {
  organization: BillingOrganization;
  subscriptionPlanData: BillingSubscriptionPlanData;
  discountedAmount: number;
  timezoneOffset: TimezoneOffset;
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
  const { organization, subscriptionPlanData, timezoneOffset, discountedAmount } = options;
  const { period } = subscriptionPlanData;
  switch (period) {
    case 'monthly': {
      if (organization.monthlyCalculationStartedAt === null) {
        return {
          ok: false,
          resultCode: resultCode('organization-monthly-calculation-started-at-not-found'),
        };
      }

      if (organization.monthlyCalculationExpiredAt === null) {
        return {
          ok: false,
          resultCode: resultCode('organization-monthly-calculation-expired-at-not-found'),
        };
      }

      const calculateElapsedDiscountResult = calculateElapsedDiscount({
        originPrice: subscriptionPlanData.originPrice,
        discountedAmount,
        calculationStartedAt: organization.monthlyCalculationStartedAt,
        calculationExpiredAt: organization.monthlyCalculationExpiredAt,
        timezoneOffset,
      });

      if (!calculateElapsedDiscountResult.ok) {
        return {
          ok: false,
          resultCode: calculateElapsedDiscountResult.resultCode,
        };
      }

      const { elapsedDiscountedAmount } = calculateElapsedDiscountResult;
      const elapsedPlan: ElapsedPlan = {
        category: subscriptionPlanData.category,
        type: subscriptionPlanData.type,
        option: subscriptionPlanData.option,
        period: subscriptionPlanData.period,
        currency: subscriptionPlanData.currency,
        amount: elapsedDiscountedAmount,
        elapsedDays: calculateElapsedDiscountResult.elapsedDays,
      };
      return {
        ok: true,
        elapsedPlan,
      };
    }
    case 'yearly': {
      if (organization.yearlyCalculationStartedAt === null) {
        return {
          ok: false,
          resultCode: resultCode('organization-yearly-calculation-started-at-not-found'),
        };
      }

      if (organization.yearlyCalculationExpiredAt === null) {
        return {
          ok: false,
          resultCode: resultCode('organization-yearly-calculation-expired-at-not-found'),
        };
      }

      const calculateElapsedDiscountResult = calculateElapsedDiscount({
        originPrice: subscriptionPlanData.originPrice,
        discountedAmount,
        calculationStartedAt: organization.yearlyCalculationStartedAt,
        calculationExpiredAt: organization.yearlyCalculationExpiredAt,
        timezoneOffset,
      });
      if (!calculateElapsedDiscountResult.ok) {
        return {
          ok: false,
          resultCode: calculateElapsedDiscountResult.resultCode,
        };
      }

      const { elapsedDiscountedAmount } = calculateElapsedDiscountResult;
      const elapsedPlan: ElapsedPlan = {
        category: subscriptionPlanData.category,
        type: subscriptionPlanData.type,
        option: subscriptionPlanData.option,
        period: subscriptionPlanData.period,
        currency: subscriptionPlanData.currency,
        amount: elapsedDiscountedAmount,
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
