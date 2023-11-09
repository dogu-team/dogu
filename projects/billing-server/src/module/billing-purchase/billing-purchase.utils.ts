import {
  BillingCurrency,
  BillingPeriod,
  BillingResult,
  BillingResultCode,
  BillingSubscriptionPlanData,
  BillingSubscriptionPlanPreviewDto,
  CouponPreviewResponse,
  ElapsedPlan,
  RemainingPlan,
  resultCode,
} from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { calculateFlooredNow, createExpiredAt, NormalizedDateTime } from '../../date-time-utils';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { ParseCouponResultSuccess } from '../billing-coupon/billing-coupon.serializables';
import { calculateCouponFactor, resolveCoupon } from '../billing-coupon/billing-coupon.utils';
import { isMonthlySubscriptionExpiredOrNull, isYearlySubscriptionExpiredOrNull } from '../billing-organization/billing-organization.utils';
import { ParseBillingSubscriptionPlanDataResultSuccess } from '../billing-subscription-plan-source/billing-subscription-plan-source.serializables';
import { ProcessPurchaseSubscriptionPreviewResultValue } from './billing-purchase.serializables';

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
  const purchasedAmount = originPrice - discountedAmount;
  if (purchasedAmount < 0) {
    return {
      ok: false,
      resultCode: resultCode('unexpected-error', {
        purchasedAmount,
      }),
    };
  }

  const remainingDiscountedAmount = (purchasedAmount * remainingDays) / totalDays;
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
  const purchasedAmount = originPrice - discountedAmount;
  if (purchasedAmount < 0) {
    return {
      ok: false,
      resultCode: resultCode('unexpected-error', {
        purchasedAmount,
      }),
    };
  }

  const elapsedDiscountedAmount = (purchasedAmount * elapsedDays) / totalDays;
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
        resultCode: resultCode('unexpected-error', {
          expiredAt: expiredAt.date.toISOString(),
          calculatedExpiredAt: calculatedExpiredAt.date.toISOString(),
        }),
      };
    }

    if (startedAt.date.getTime() > expiredAt.date.getTime()) {
      return {
        ok: false,
        resultCode: resultCode('unexpected-error', {
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
        resultCode: resultCode('unexpected-error', {
          expiredAt: expiredAt.date.toISOString(),
          calculatedExpiredAt: expiredAtCalculated.date.toISOString(),
        }),
      };
    }

    if (startedAt.date.getTime() > expiredAt.date.getTime()) {
      return {
        ok: false,
        resultCode: resultCode('unexpected-error', {
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

export interface ProcessPurchaseSubscriptionPreviewInternalOptions {
  dto: BillingSubscriptionPlanPreviewDto;
  billingOrganization: BillingOrganization;
  resolvedCurrency: BillingCurrency;
  parseSubscriptionPlanDataResult: ParseBillingSubscriptionPlanDataResultSuccess;
  parseCouponResult: ParseCouponResultSuccess;
}

export function processPurchaseSubscriptionPreviewInternal(
  options: ProcessPurchaseSubscriptionPreviewInternalOptions,
): BillingResult<ProcessPurchaseSubscriptionPreviewResultValue> {
  const { dto, billingOrganization, resolvedCurrency, parseSubscriptionPlanDataResult, parseCouponResult } = options;
  if (billingOrganization.category !== dto.category) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-category-not-matched', {
        billingOrganizationCategory: billingOrganization.category,
        category: dto.category,
      }),
    };
  }

  const now = new Date();
  const calculatePurchaseSubscriptionDateTimesResult = calculatePurchaseSubscriptionDateTimes({
    billingOrganization,
    now,
  });
  if (!calculatePurchaseSubscriptionDateTimesResult.ok) {
    return {
      ok: false,
      resultCode: calculatePurchaseSubscriptionDateTimesResult.resultCode,
    };
  }

  const infos = billingOrganization.billingSubscriptionPlanInfos ?? [];
  if (infos.length > 0 && infos.some((plan) => plan.currency !== resolvedCurrency)) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-currency-not-matched', {
        billingOrganizationCurrency: billingOrganization.currency,
        resolvedCurrency,
      }),
    };
  }

  const { billingSubscriptionPlanData: data, billingSubscriptionPlanSource: source } = parseSubscriptionPlanDataResult;
  const dataDateTimes = getPurchaseSubscriptionDateTimes(calculatePurchaseSubscriptionDateTimesResult, data.period);

  const { coupon: newCoupon } = parseCouponResult;

  const foundInfo = infos.find((plan) => plan.type === data.type);

  const couponResult = resolveCoupon({
    billingSubscriptionPlanInfo: foundInfo,
    newCoupon,
    period: data.period,
  });
  if (!couponResult.ok) {
    return {
      ok: couponResult.ok,
      resultCode: couponResult.resultCode,
    };
  }
  const { coupon } = couponResult;

  const { firstCouponFactor, secondCouponFactor } = calculateCouponFactor({
    couponResult,
    period: data.period,
  });

  if (foundInfo === undefined) {
    const totalPrice = Math.floor(data.originPrice * firstCouponFactor);
    const nextPurchaseTotalPrice = Math.floor(data.originPrice * secondCouponFactor);
    const discountedAmount = data.originPrice - totalPrice;
    const couponPreviewResponse: CouponPreviewResponse | null = coupon
      ? {
          ...coupon,
          discountedAmount,
        }
      : null;

    const calculateElapsedPlanResult = calculateElapsedPlan({
      data,
      discountedAmount,
      dateTimes: dataDateTimes,
    });
    if (!calculateElapsedPlanResult.ok) {
      return {
        ok: false,
        resultCode: calculateElapsedPlanResult.resultCode,
      };
    }
    const { elapsedPlan } = calculateElapsedPlanResult;

    return {
      ok: true,
      value: {
        previewResponse: {
          ok: true,
          resultCode: resultCode('ok'),
          totalPrice,
          tax: 0,
          nextPurchaseTotalPrice,
          nextPurchasedAt: dataDateTimes.expiredAt.date,
          subscriptionPlan: data,
          elapsedPlans: elapsedPlan.elapsedDays > 0 ? [elapsedPlan] : [],
          remainingPlans: [],
          coupon: couponPreviewResponse,
        },
        data,
        source,
        couponResult,
        discountedAmount,
        totalPrice,
        now,
        needPurchase: true,
        dateTimes: calculatePurchaseSubscriptionDateTimesResult,
        planHistory: {
          billingCouponId: coupon?.billingCouponId ?? null,
          billingSubscriptionPlanSourceId: source?.billingSubscriptionPlanSourceId ?? null,
          discountedAmount,
          purchasedAmount: totalPrice,
          startedAt: dataDateTimes.startedAt.date,
          expiredAt: dataDateTimes.expiredAt.date,
          elapsedDays: elapsedPlan.elapsedDays,
          elapsedDiscountedAmount: elapsedPlan.elapsedDiscountedAmount,
          previousRemainingDays: null,
          previousRemainingDiscountedAmount: null,
          previousOption: null,
          previousPeriod: null,
          category: data.category,
          type: data.type,
          option: data.option,
          currency: data.currency,
          period: data.period,
          originPrice: data.originPrice,
        },
      },
    };
  } else {
    const infoDateTimes = getPurchaseSubscriptionDateTimes(calculatePurchaseSubscriptionDateTimesResult, foundInfo.period);

    const processNowPurchaseReturn = (): BillingResult<ProcessPurchaseSubscriptionPreviewResultValue> => {
      const calculateRemainingPlanResult = calculateRemainingPlan({
        foundInfo,
        dateTimes: infoDateTimes,
      });

      if (!calculateRemainingPlanResult.ok) {
        return {
          ok: false,
          resultCode: calculateRemainingPlanResult.resultCode,
        };
      }
      const { remainingPlan } = calculateRemainingPlanResult;
      const { remainingDiscountedAmount } = remainingPlan;

      const remainingPurchaseAmount = data.originPrice - remainingDiscountedAmount;
      const currentPurchaseAmount = remainingPurchaseAmount * firstCouponFactor;
      const discountedAmount = remainingPurchaseAmount - currentPurchaseAmount;
      const couponPreviewResponse: CouponPreviewResponse | null = coupon
        ? {
            ...coupon,
            discountedAmount,
          }
        : null;

      const calculateElapsedPlanResult = calculateElapsedPlan({
        data,
        discountedAmount,
        dateTimes: dataDateTimes,
      });

      if (!calculateElapsedPlanResult.ok) {
        return {
          ok: false,
          resultCode: calculateElapsedPlanResult.resultCode,
        };
      }
      const { elapsedPlan } = calculateElapsedPlanResult;

      const totalPrice = Math.floor(currentPurchaseAmount - elapsedPlan.elapsedDiscountedAmount);
      const nextPurchaseAmount = Math.floor(data.originPrice * secondCouponFactor);
      const nextPurchasedAt = dataDateTimes.expiredAt.date;
      return {
        ok: true,
        value: {
          previewResponse: {
            ok: true,
            resultCode: resultCode('ok'),
            totalPrice,
            tax: 0,
            nextPurchaseTotalPrice: nextPurchaseAmount,
            nextPurchasedAt,
            subscriptionPlan: data,
            coupon: couponPreviewResponse,
            elapsedPlans: elapsedPlan.elapsedDays > 0 ? [elapsedPlan] : [],
            remainingPlans: [remainingPlan],
          },
          data,
          source,
          couponResult,
          discountedAmount,
          totalPrice,
          now,
          needPurchase: true,
          dateTimes: calculatePurchaseSubscriptionDateTimesResult,
          planHistory: {
            billingCouponId: coupon?.billingCouponId ?? null,
            billingSubscriptionPlanSourceId: source?.billingSubscriptionPlanSourceId ?? null,
            discountedAmount,
            purchasedAmount: totalPrice,
            startedAt: dataDateTimes.startedAt.date,
            expiredAt: dataDateTimes.expiredAt.date,
            elapsedDays: elapsedPlan.elapsedDays,
            elapsedDiscountedAmount: elapsedPlan.elapsedDiscountedAmount,
            previousRemainingDays: remainingPlan.remainingDays,
            previousRemainingDiscountedAmount: remainingPlan.remainingDiscountedAmount,
            previousOption: remainingPlan.option,
            previousPeriod: remainingPlan.period,
            category: data.category,
            type: data.type,
            option: data.option,
            currency: data.currency,
            period: data.period,
            originPrice: data.originPrice,
          },
        },
      };
    };

    const processNextPurchaseReturn = (): BillingResult<ProcessPurchaseSubscriptionPreviewResultValue> => {
      const nextPurchaseAmount = Math.floor(data.originPrice * firstCouponFactor);
      const discountedAmount = data.originPrice - nextPurchaseAmount;
      const couponPreviewResponse: CouponPreviewResponse | null = coupon
        ? {
            ...coupon,
            discountedAmount,
          }
        : null;

      const nextPurchasedAt = infoDateTimes.expiredAt.date;
      return {
        ok: true,
        value: {
          previewResponse: {
            ok: true,
            resultCode: resultCode('ok'),
            totalPrice: 0,
            tax: 0,
            nextPurchaseTotalPrice: nextPurchaseAmount,
            nextPurchasedAt,
            subscriptionPlan: data,
            coupon: couponPreviewResponse,
            elapsedPlans: [],
            remainingPlans: [],
          },
          data,
          source,
          couponResult,
          discountedAmount: 0,
          totalPrice: 0,
          now,
          needPurchase: false,
          dateTimes: calculatePurchaseSubscriptionDateTimesResult,
          planHistory: null,
        },
      };
    };

    if (foundInfo.period === 'monthly' && data.period === 'yearly') {
      if (foundInfo.option < data.option) {
        return processNowPurchaseReturn();
      } else if (foundInfo.option === data.option) {
        return processNowPurchaseReturn();
      } else if (foundInfo.option > data.option) {
        return processNextPurchaseReturn();
      } else {
        return {
          ok: false,
          resultCode: resultCode('unexpected-error', {
            foundInfoOption: foundInfo.option,
            dataOption: data.option,
          }),
        };
      }
    } else if (foundInfo.period === data.period) {
      if (foundInfo.option < data.option) {
        return processNowPurchaseReturn();
      } else if (foundInfo.option === data.option) {
        return {
          ok: false,
          resultCode: resultCode('subscription-plan-duplicated'),
        };
      } else if (foundInfo.option > data.option) {
        return processNextPurchaseReturn();
      } else {
        return {
          ok: false,
          resultCode: resultCode('unexpected-error', {
            foundInfoOption: foundInfo.option,
            dataOption: data.option,
          }),
        };
      }
    } else if (foundInfo.period === 'yearly' && data.period === 'monthly') {
      if (foundInfo.option < data.option) {
        return processNextPurchaseReturn();
      } else if (foundInfo.option === data.option) {
        return processNextPurchaseReturn();
      } else if (foundInfo.option > data.option) {
        return processNextPurchaseReturn();
      } else {
        return {
          ok: false,
          resultCode: resultCode('unexpected-error', {
            foundInfoOption: foundInfo.option,
            dataOption: data.option,
          }),
        };
      }
    } else {
      return {
        ok: false,
        resultCode: resultCode('unexpected-error', {
          foundInfoPeriod: foundInfo.period,
          dataPeriod: data.period,
        }),
      };
    }
  }
}
