import {
  BillingCurrency,
  BillingPeriod,
  BillingPlanHistoryData,
  BillingResult,
  BillingResultCode,
  CouponPreviewResponse,
  ElapsedPlan,
  GetBillingPreviewResponse,
  RemainingPlan,
  resultCode,
} from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { calculateFlooredNow, createExpiredAt, NormalizedDateTime } from '../../date-time-utils';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { BillingPlanSource } from '../../db/entity/billing-plan-source.entity';
import { calculateCouponFactor, resolveCoupon, ResolveCouponResultSuccess } from '../billing-coupon/billing-coupon.utils';
import { isMonthlySubscriptionExpiredOrNull, isYearlySubscriptionExpiredOrNull } from '../billing-organization/billing-organization.utils';
import { PreprocessResult } from './billing-purchase.serializables';

export function resolveCurrency(organizationCurrency: BillingCurrency | null, argumentCurrency: BillingCurrency): BillingCurrency {
  const currency = organizationCurrency ?? argumentCurrency;
  return currency;
}

export interface CalculateRemainingPlanOptions {
  foundInfo: BillingPlanInfo;
  dateTimes: PurchaseDateTimes;
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
  planSource: BillingPlanSource;
  remainingPurchaseAmount: number;
  discountedAmount: number;
  dateTimes: PurchaseDateTimes;
}

export type CalculateElapsedPlanResult = BillingResult<ElapsedPlan>;

export function calculateElapsedPlan(options: CalculateElapsedPlanOptions): CalculateElapsedPlanResult {
  const { planSource, remainingPurchaseAmount, discountedAmount, dateTimes } = options;
  const { period, category, type, option, currency } = planSource;
  const { totalDays, elapsedDays } = dateTimes;
  const purchasedAmount = remainingPurchaseAmount - discountedAmount;
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

export interface PurchaseDateTimes {
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

export interface CalculateYearlyPurchaseDateTimesOptions {
  organization: BillingOrganization;
  now: Date;
}

export interface CalculateYearlyPurchaseDateTimesResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculateYearlyPurchaseDateTimesResultSuccess extends PurchaseDateTimes {
  ok: true;
}

export type CalculateYearlyPurchaseDateTimesResult = CalculateYearlyPurchaseDateTimesResultFailure | CalculateYearlyPurchaseDateTimesResultSuccess;

export function calculateYearlyPurchaseDateTimes(options: CalculateYearlyPurchaseDateTimesOptions): CalculateYearlyPurchaseDateTimesResult {
  const { organization, now } = options;
  if (isYearlySubscriptionExpiredOrNull(organization, now)) {
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
    if (organization.subscriptionYearlyStartedAt === null) {
      return {
        ok: false,
        resultCode: resultCode('organization-subscription-yearly-started-at-not-found', {
          billingOrganizationId: organization.billingOrganizationId,
        }),
      };
    }

    if (organization.subscriptionYearlyExpiredAt === null) {
      return {
        ok: false,
        resultCode: resultCode('organization-subscription-yearly-expired-at-not-found', {
          billingOrganizationId: organization.billingOrganizationId,
        }),
      };
    }

    const notNormalizedStartedAt = organization.subscriptionYearlyStartedAt;
    const startedAt = NormalizedDateTime.fromDate(notNormalizedStartedAt);
    const calculatedExpiredAt = createExpiredAt(startedAt, 'yearly');
    const expiredAt = NormalizedDateTime.fromDate(organization.subscriptionYearlyExpiredAt);
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

export interface CalculateMonthlyPurchaseDateTimesOptions {
  organization: BillingOrganization;
  now: Date;
}

export interface CalculateMonthlyPurchaseDateTimesResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculateMonthlyPurchaseDateTimesResultSuccess extends PurchaseDateTimes {
  ok: true;
}

export type CalculateMonthlyPurchaseDateTimesResult = CalculateMonthlyPurchaseDateTimesResultFailure | CalculateMonthlyPurchaseDateTimesResultSuccess;

export function calculateMonthlyPurchaseDateTimes(options: CalculateMonthlyPurchaseDateTimesOptions): CalculateMonthlyPurchaseDateTimesResult {
  const { organization, now } = options;
  if (isMonthlySubscriptionExpiredOrNull(organization, now)) {
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
    if (organization.subscriptionMonthlyStartedAt === null) {
      return {
        ok: false,
        resultCode: resultCode('organization-subscription-monthly-started-at-not-found', {
          billingOrganizationId: organization.billingOrganizationId,
        }),
      };
    }

    if (organization.subscriptionMonthlyExpiredAt === null) {
      return {
        ok: false,
        resultCode: resultCode('organization-subscription-monthly-expired-at-not-found', {
          billingOrganizationId: organization.billingOrganizationId,
        }),
      };
    }

    const notNormalizedStartedAt = organization.subscriptionMonthlyStartedAt;
    const startedAt = NormalizedDateTime.fromDate(notNormalizedStartedAt);
    const expiredAtCalculated = createExpiredAt(startedAt, 'monthly');
    const expiredAt = NormalizedDateTime.fromDate(organization.subscriptionMonthlyExpiredAt);
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

export interface CalculatePurchaseDateTimesOptions {
  organization: BillingOrganization;
  now: Date;
}

export interface CalculatePurchaseDateTimesResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculatePurchaseDateTimesResultSuccess {
  ok: true;
  yearlyDateTimes: CalculateYearlyPurchaseDateTimesResultSuccess;
  monthlyDateTimes: CalculateMonthlyPurchaseDateTimesResultSuccess;
}

export type CalculatePurchaseDateTimesResult = CalculatePurchaseDateTimesResultFailure | CalculatePurchaseDateTimesResultSuccess;

export function calculatePurchaseDateTimes(options: CalculatePurchaseDateTimesOptions): CalculatePurchaseDateTimesResult {
  const { organization, now } = options;
  const yearlyResult = calculateYearlyPurchaseDateTimes({ organization, now });
  if (!yearlyResult.ok) {
    return {
      ok: false,
      resultCode: yearlyResult.resultCode,
    };
  }

  const monthlyResult = calculateMonthlyPurchaseDateTimes({ organization, now });
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

export function getPurchaseDateTimes(dateTimes: CalculatePurchaseDateTimesResultSuccess, period: BillingPeriod): PurchaseDateTimes {
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

export type ProcessPurchasePreviewOptions = PreprocessResult;

export interface ProcessPurchasePreviewResult {
  previewResponse: GetBillingPreviewResponse;
  couponResult: ResolveCouponResultSuccess;
  needPurchase: boolean;
  totalPrice: number;
  discountedAmount: number;
  now: Date;
  dateTimes: CalculatePurchaseDateTimesResultSuccess;
  planHistory: BillingPlanHistoryData | null;
}

export function processPurchasePreview(options: ProcessPurchasePreviewOptions): BillingResult<ProcessPurchasePreviewResult> {
  const { organization, currency, planSource, now } = options;
  const newCoupon = options.coupon;

  if (organization.category !== planSource.category) {
    return {
      ok: false,
      resultCode: resultCode('plan-category-not-matched', {
        organizationCategory: organization.category,
        category: planSource.category,
      }),
    };
  }

  const calculatePurchaseDateTimesResult = calculatePurchaseDateTimes({
    organization,
    now,
  });
  if (!calculatePurchaseDateTimesResult.ok) {
    return {
      ok: false,
      resultCode: calculatePurchaseDateTimesResult.resultCode,
    };
  }

  const infos = organization.billingPlanInfos ?? [];
  if (infos.length > 0 && infos.some((plan) => plan.currency !== currency)) {
    return {
      ok: false,
      resultCode: resultCode('plan-currency-not-matched', {
        organizationCurrency: organization.currency,
        currency,
      }),
    };
  }

  const dataDateTimes = getPurchaseDateTimes(calculatePurchaseDateTimesResult, planSource.period);

  const foundInfo = infos.find((plan) => plan.type === planSource.type && plan.state !== 'unsubscribed');

  const couponResult = resolveCoupon({
    planInfo: foundInfo,
    newCoupon,
    period: planSource.period,
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
    period: planSource.period,
  });

  if (foundInfo === undefined) {
    const remainingPurchaseAmount = planSource.originPrice;
    const currentPurchaseAmount = remainingPurchaseAmount * firstCouponFactor;
    const discountedAmount = remainingPurchaseAmount - currentPurchaseAmount;

    const totalPrice = Math.floor(currentPurchaseAmount);
    const nextPurchaseTotalPrice = Math.floor(planSource.originPrice * secondCouponFactor);

    const couponPreviewResponse: CouponPreviewResponse | null = coupon
      ? {
          ...coupon,
          discountedAmount,
        }
      : null;

    const calculateElapsedPlanResult = calculateElapsedPlan({
      planSource,
      remainingPurchaseAmount,
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
          plan: {
            category: planSource.category,
            type: planSource.type,
            option: planSource.option,
            period: planSource.period,
            currency: planSource.currency,
            originPrice: planSource.originPrice,
          },
          elapsedPlans: elapsedPlan.elapsedDays > 0 ? [elapsedPlan] : [],
          remainingPlans: [],
          coupon: couponPreviewResponse,
        },
        couponResult,
        discountedAmount,
        totalPrice,
        now,
        needPurchase: true,
        dateTimes: calculatePurchaseDateTimesResult,
        planHistory: {
          billingCouponId: coupon?.billingCouponId ?? null,
          billingPlanSourceId: planSource?.billingPlanSourceId ?? null,
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
          category: planSource.category,
          type: planSource.type,
          option: planSource.option,
          currency: planSource.currency,
          period: planSource.period,
          originPrice: planSource.originPrice,
        },
      },
    };
  } else {
    const infoDateTimes = getPurchaseDateTimes(calculatePurchaseDateTimesResult, foundInfo.period);

    const processNowPurchaseReturn = (): BillingResult<ProcessPurchasePreviewResult> => {
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

      const remainingPurchaseAmount = planSource.originPrice - remainingDiscountedAmount;
      const currentPurchaseAmount = remainingPurchaseAmount * firstCouponFactor;
      const discountedAmount = remainingPurchaseAmount - currentPurchaseAmount;
      const couponPreviewResponse: CouponPreviewResponse | null = coupon
        ? {
            ...coupon,
            discountedAmount,
          }
        : null;

      const calculateElapsedPlanResult = calculateElapsedPlan({
        planSource,
        remainingPurchaseAmount,
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
      const nextPurchaseAmount = Math.floor(planSource.originPrice * secondCouponFactor);
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
            plan: {
              category: planSource.category,
              type: planSource.type,
              option: planSource.option,
              period: planSource.period,
              currency: planSource.currency,
              originPrice: planSource.originPrice,
            },
            coupon: couponPreviewResponse,
            elapsedPlans: elapsedPlan.elapsedDays > 0 ? [elapsedPlan] : [],
            remainingPlans: [remainingPlan],
          },
          couponResult,
          discountedAmount,
          totalPrice,
          now,
          needPurchase: true,
          dateTimes: calculatePurchaseDateTimesResult,
          planHistory: {
            billingCouponId: coupon?.billingCouponId ?? null,
            billingPlanSourceId: planSource?.billingPlanSourceId ?? null,
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
            category: planSource.category,
            type: planSource.type,
            option: planSource.option,
            currency: planSource.currency,
            period: planSource.period,
            originPrice: planSource.originPrice,
          },
        },
      };
    };

    const processNextPurchaseReturn = (): BillingResult<ProcessPurchasePreviewResult> => {
      const nextPurchaseAmount = Math.floor(planSource.originPrice * firstCouponFactor);
      const discountedAmount = planSource.originPrice - nextPurchaseAmount;
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
            plan: {
              category: planSource.category,
              type: planSource.type,
              option: planSource.option,
              period: planSource.period,
              currency: planSource.currency,
              originPrice: planSource.originPrice,
            },
            coupon: couponPreviewResponse,
            elapsedPlans: [],
            remainingPlans: [],
          },
          couponResult,
          discountedAmount: 0,
          totalPrice: 0,
          now,
          needPurchase: false,
          dateTimes: calculatePurchaseDateTimesResult,
          planHistory: null,
        },
      };
    };

    if (foundInfo.period === 'monthly' && planSource.period === 'yearly') {
      if (foundInfo.option < planSource.option) {
        return processNowPurchaseReturn();
      } else if (foundInfo.option === planSource.option) {
        return processNowPurchaseReturn();
      } else if (foundInfo.option > planSource.option) {
        return processNextPurchaseReturn();
      } else {
        return {
          ok: false,
          resultCode: resultCode('unexpected-error', {
            foundInfoOption: foundInfo.option,
            planSourceOption: planSource.option,
          }),
        };
      }
    } else if (foundInfo.period === planSource.period) {
      if (foundInfo.option < planSource.option) {
        return processNowPurchaseReturn();
      } else if (foundInfo.option === planSource.option) {
        return {
          ok: false,
          resultCode: resultCode('plan-duplicated'),
        };
      } else if (foundInfo.option > planSource.option) {
        return processNextPurchaseReturn();
      } else {
        return {
          ok: false,
          resultCode: resultCode('unexpected-error', {
            foundInfoOption: foundInfo.option,
            planSourceOption: planSource.option,
          }),
        };
      }
    } else if (foundInfo.period === 'yearly' && planSource.period === 'monthly') {
      if (foundInfo.option < planSource.option) {
        return processNextPurchaseReturn();
      } else if (foundInfo.option === planSource.option) {
        return processNextPurchaseReturn();
      } else if (foundInfo.option > planSource.option) {
        return processNextPurchaseReturn();
      } else {
        return {
          ok: false,
          resultCode: resultCode('unexpected-error', {
            foundInfoOption: foundInfo.option,
            planSourceOption: planSource.option,
          }),
        };
      }
    } else {
      return {
        ok: false,
        resultCode: resultCode('unexpected-error', {
          foundInfoPeriod: foundInfo.period,
          planSourcePeriod: planSource.period,
        }),
      };
    }
  }
}
