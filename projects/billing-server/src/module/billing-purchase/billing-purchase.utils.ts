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
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { calculateCouponFactor, resolveCoupon } from '../billing-coupon/billing-coupon.utils';
import { isMonthlySubscriptionExpiredOrNull, isYearlySubscriptionExpiredOrNull } from '../billing-organization/billing-organization.utils';
import { ParseSubscriptionPlanDataResultValue } from '../billing-subscription-plan-source/billing-subscription-plan-source.serializables';
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
  planData: BillingSubscriptionPlanData;
  discountedAmount: number;
  dateTimes: PurchaseSubscriptionDateTimes;
}

export type CalculateElapsedPlanResult = BillingResult<ElapsedPlan>;

export function calculateElapsedPlan(options: CalculateElapsedPlanOptions): CalculateElapsedPlanResult {
  const { planData, discountedAmount, dateTimes } = options;
  const { originPrice, period, category, type, option, currency } = planData;
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
    value: {
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
  parseSubscriptionPlanDataResultValue: ParseSubscriptionPlanDataResultValue;
  coupon: BillingCoupon | null;
  now: Date;
}

export function processPurchaseSubscriptionPreviewInternal(
  options: ProcessPurchaseSubscriptionPreviewInternalOptions,
): BillingResult<ProcessPurchaseSubscriptionPreviewResultValue> {
  const { dto, billingOrganization, resolvedCurrency, parseSubscriptionPlanDataResultValue, now } = options;
  const newCoupon = options.coupon;

  if (billingOrganization.category !== dto.category) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-category-not-matched', {
        billingOrganizationCategory: billingOrganization.category,
        category: dto.category,
      }),
    };
  }

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

  const { planData, planSource } = parseSubscriptionPlanDataResultValue;
  const dataDateTimes = getPurchaseSubscriptionDateTimes(calculatePurchaseSubscriptionDateTimesResult, planData.period);

  const foundInfo = infos.find((plan) => plan.type === planData.type);

  const couponResult = resolveCoupon({
    billingSubscriptionPlanInfo: foundInfo,
    newCoupon,
    period: planData.period,
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
    period: planData.period,
  });

  if (foundInfo === undefined) {
    const totalPrice = Math.floor(planData.originPrice * firstCouponFactor);
    const nextPurchaseTotalPrice = Math.floor(planData.originPrice * secondCouponFactor);
    const discountedAmount = planData.originPrice - totalPrice;
    const couponPreviewResponse: CouponPreviewResponse | null = coupon
      ? {
          ...coupon,
          discountedAmount,
        }
      : null;

    const calculateElapsedPlanResult = calculateElapsedPlan({
      planData,
      discountedAmount,
      dateTimes: dataDateTimes,
    });
    if (!calculateElapsedPlanResult.ok) {
      return {
        ok: false,
        resultCode: calculateElapsedPlanResult.resultCode,
      };
    }
    const elapsedPlan = calculateElapsedPlanResult.value;

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
          subscriptionPlan: planData,
          elapsedPlans: elapsedPlan.elapsedDays > 0 ? [elapsedPlan] : [],
          remainingPlans: [],
          coupon: couponPreviewResponse,
        },
        planData,
        planSource,
        couponResult,
        discountedAmount,
        totalPrice,
        now,
        needPurchase: true,
        dateTimes: calculatePurchaseSubscriptionDateTimesResult,
        planHistory: {
          billingCouponId: coupon?.billingCouponId ?? null,
          billingSubscriptionPlanSourceId: planSource?.billingSubscriptionPlanSourceId ?? null,
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
          category: planData.category,
          type: planData.type,
          option: planData.option,
          currency: planData.currency,
          period: planData.period,
          originPrice: planData.originPrice,
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

      const remainingPurchaseAmount = planData.originPrice - remainingDiscountedAmount;
      const currentPurchaseAmount = remainingPurchaseAmount * firstCouponFactor;
      const discountedAmount = remainingPurchaseAmount - currentPurchaseAmount;
      const couponPreviewResponse: CouponPreviewResponse | null = coupon
        ? {
            ...coupon,
            discountedAmount,
          }
        : null;

      const calculateElapsedPlanResult = calculateElapsedPlan({
        planData,
        discountedAmount,
        dateTimes: dataDateTimes,
      });

      if (!calculateElapsedPlanResult.ok) {
        return {
          ok: false,
          resultCode: calculateElapsedPlanResult.resultCode,
        };
      }
      const elapsedPlan = calculateElapsedPlanResult.value;

      const totalPrice = Math.floor(currentPurchaseAmount - elapsedPlan.elapsedDiscountedAmount);
      const nextPurchaseAmount = Math.floor(planData.originPrice * secondCouponFactor);
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
            subscriptionPlan: planData,
            coupon: couponPreviewResponse,
            elapsedPlans: elapsedPlan.elapsedDays > 0 ? [elapsedPlan] : [],
            remainingPlans: [remainingPlan],
          },
          planData,
          planSource,
          couponResult,
          discountedAmount,
          totalPrice,
          now,
          needPurchase: true,
          dateTimes: calculatePurchaseSubscriptionDateTimesResult,
          planHistory: {
            billingCouponId: coupon?.billingCouponId ?? null,
            billingSubscriptionPlanSourceId: planSource?.billingSubscriptionPlanSourceId ?? null,
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
            category: planData.category,
            type: planData.type,
            option: planData.option,
            currency: planData.currency,
            period: planData.period,
            originPrice: planData.originPrice,
          },
        },
      };
    };

    const processNextPurchaseReturn = (): BillingResult<ProcessPurchaseSubscriptionPreviewResultValue> => {
      const nextPurchaseAmount = Math.floor(planData.originPrice * firstCouponFactor);
      const discountedAmount = planData.originPrice - nextPurchaseAmount;
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
            subscriptionPlan: planData,
            coupon: couponPreviewResponse,
            elapsedPlans: [],
            remainingPlans: [],
          },
          planData,
          planSource,
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

    if (foundInfo.period === 'monthly' && planData.period === 'yearly') {
      if (foundInfo.option < planData.option) {
        return processNowPurchaseReturn();
      } else if (foundInfo.option === planData.option) {
        return processNowPurchaseReturn();
      } else if (foundInfo.option > planData.option) {
        return processNextPurchaseReturn();
      } else {
        return {
          ok: false,
          resultCode: resultCode('unexpected-error', {
            foundInfoOption: foundInfo.option,
            planDataOption: planData.option,
          }),
        };
      }
    } else if (foundInfo.period === planData.period) {
      if (foundInfo.option < planData.option) {
        return processNowPurchaseReturn();
      } else if (foundInfo.option === planData.option) {
        return {
          ok: false,
          resultCode: resultCode('subscription-plan-duplicated'),
        };
      } else if (foundInfo.option > planData.option) {
        return processNextPurchaseReturn();
      } else {
        return {
          ok: false,
          resultCode: resultCode('unexpected-error', {
            foundInfoOption: foundInfo.option,
            planDataOption: planData.option,
          }),
        };
      }
    } else if (foundInfo.period === 'yearly' && planData.period === 'monthly') {
      if (foundInfo.option < planData.option) {
        return processNextPurchaseReturn();
      } else if (foundInfo.option === planData.option) {
        return processNextPurchaseReturn();
      } else if (foundInfo.option > planData.option) {
        return processNextPurchaseReturn();
      } else {
        return {
          ok: false,
          resultCode: resultCode('unexpected-error', {
            foundInfoOption: foundInfo.option,
            planDataOption: planData.option,
          }),
        };
      }
    } else {
      return {
        ok: false,
        resultCode: resultCode('unexpected-error', {
          foundInfoPeriod: foundInfo.period,
          planDataPeriod: planData.period,
        }),
      };
    }
  }
}
