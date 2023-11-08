import {
  BillingMethodNiceBase,
  BillingResultCode,
  BillingSubscriptionPlanData,
  BillingSubscriptionPlanHistoryData,
  BillingSubscriptionPlanInfoResponse,
  BillingSubscriptionPlanPreviewDto,
  CouponPreviewResponse,
  CreatePurchaseSubscriptionResponse,
  GetBillingSubscriptionPreviewResponse,
  resultCode,
} from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { v4 } from 'uuid';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanHistory } from '../../db/entity/billing-subscription-plan-history.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { RetrySerializeContext } from '../../db/utils';
import { parseCoupon, useCoupon } from '../billing-coupon/billing-coupon.serializables';
import { calculateCouponFactor, resolveCoupon, ResolveCouponResultSuccess } from '../billing-coupon/billing-coupon.utils';
import { BillingMethodNiceCaller } from '../billing-method/billing-method-nice.caller';
import { createPurchase } from '../billing-method/billing-method-nice.serializables';
import { createOrUpdateBillingSubscriptionPlanInfo } from '../billing-subscription-plan-info/billing-subscription-plan-info.serializables';
import { parseBillingSubscriptionPlanData } from '../billing-subscription-plan-source/billing-subscription-plan-source.serializables';
import { applyCloudLicense } from '../cloud-license/cloud-license.serializables';
import {
  calculateElapsedPlan,
  calculatePurchaseSubscriptionDateTimes,
  CalculatePurchaseSubscriptionDateTimesResultSuccess,
  calculateRemainingPlan,
  getPurchaseSubscriptionDateTimes,
  resolveCurrency,
} from './billing-purchase.utils';

export interface ProcessPurchaseSubscriptionPreviewOptions {
  billingOrganization: BillingOrganization;
  dto: BillingSubscriptionPlanPreviewDto;
}

export interface ProcessPurchaseSubscriptionPreviewResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface ProcessPurchaseSubscriptionPreviewResultSuccess {
  ok: true;
  previewResponse: GetBillingSubscriptionPreviewResponse;
  couponResult: ResolveCouponResultSuccess;
  data: BillingSubscriptionPlanData;
  source: BillingSubscriptionPlanSource | null;
  needPurchase: boolean;
  totalPrice: number;
  discountedAmount: number;
  now: Date;
  dateTimes: CalculatePurchaseSubscriptionDateTimesResultSuccess;
  planHistory: BillingSubscriptionPlanHistoryData | null;
}

export type ProcessPurchaseSubscriptionPreviewResult = ProcessPurchaseSubscriptionPreviewResultFailure | ProcessPurchaseSubscriptionPreviewResultSuccess;

export async function processPurchaseSubscriptionPreview(
  context: RetrySerializeContext,
  options: ProcessPurchaseSubscriptionPreviewOptions,
): Promise<ProcessPurchaseSubscriptionPreviewResult> {
  const { billingOrganization, dto } = options;
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

  const { billingOrganizationId, organizationId } = billingOrganization;
  const currency = resolveCurrency(billingOrganization.currency, dto.currency);

  const infos = billingOrganization.billingSubscriptionPlanInfos ?? [];
  if (infos.length > 0 && infos.some((plan) => plan.currency !== currency)) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-currency-not-matched', {
        billingOrganizationCurrency: billingOrganization.currency,
        currency,
      }),
    };
  }

  const parseSubscriptionPlanDataResult = await parseBillingSubscriptionPlanData(context, {
    billingOrganizationId,
    type: dto.type,
    category: dto.category,
    option: dto.option,
    currency,
    period: dto.period,
  });
  if (!parseSubscriptionPlanDataResult.ok) {
    return {
      ok: parseSubscriptionPlanDataResult.ok,
      resultCode: parseSubscriptionPlanDataResult.resultCode,
    };
  }
  const { billingSubscriptionPlanData: data, billingSubscriptionPlanSource: source } = parseSubscriptionPlanDataResult;
  const dateTimes = getPurchaseSubscriptionDateTimes(calculatePurchaseSubscriptionDateTimesResult, data.period);

  const parseCouponResult = await parseCoupon({
    context,
    organizationId,
    couponCode: dto.couponCode,
    period: dto.period,
  });
  if (!parseCouponResult.ok) {
    return {
      ok: parseCouponResult.ok,
      resultCode: parseCouponResult.resultCode,
    };
  }
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
    coupon,
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
      dateTimes,
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
      previewResponse: {
        ok: true,
        resultCode: resultCode('ok'),
        totalPrice,
        tax: 0,
        nextPurchaseTotalPrice,
        nextPurchasedAt: dateTimes.expiredAt.date,
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
        startedAt: dateTimes.startedAt.date,
        expiredAt: dateTimes.expiredAt.date,
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
    };
  } else {
    const processNowPurchaseReturn = (): ProcessPurchaseSubscriptionPreviewResult => {
      const currentPurchaseAmount = data.originPrice * firstCouponFactor;
      const discountedAmount = data.originPrice - currentPurchaseAmount;
      const couponPreviewResponse: CouponPreviewResponse | null = coupon
        ? {
            ...coupon,
            discountedAmount,
          }
        : null;

      const calculateElapsedPlanResult = calculateElapsedPlan({
        data,
        discountedAmount,
        dateTimes,
      });
      if (!calculateElapsedPlanResult.ok) {
        return {
          ok: false,
          resultCode: calculateElapsedPlanResult.resultCode,
        };
      }
      const { elapsedPlan } = calculateElapsedPlanResult;

      const calculateRemainingPlanResult = calculateRemainingPlan({
        foundInfo,
        dateTimes,
      });
      if (!calculateRemainingPlanResult.ok) {
        return {
          ok: false,
          resultCode: calculateRemainingPlanResult.resultCode,
        };
      }
      const { remainingPlan } = calculateRemainingPlanResult;

      const totalPrice = Math.floor(currentPurchaseAmount - remainingPlan.remainingDiscountedAmount - elapsedPlan.elapsedDiscountedAmount);
      const nextPurchaseAmount = Math.floor(data.originPrice * secondCouponFactor);
      const nextPurchasedAt = dateTimes.expiredAt.date;
      return {
        ok: true,
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
          startedAt: dateTimes.startedAt.date,
          expiredAt: dateTimes.expiredAt.date,
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
      };
    };

    const processNextPurchaseReturn = (): ProcessPurchaseSubscriptionPreviewResult => {
      const nextPurchaseAmount = Math.floor(data.originPrice * firstCouponFactor);
      const discountedAmount = data.originPrice - nextPurchaseAmount;
      const couponPreviewResponse: CouponPreviewResponse | null = coupon
        ? {
            ...coupon,
            discountedAmount,
          }
        : null;

      const nextPurchasedAt = dateTimes.expiredAt.date;
      return {
        ok: true,
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

export interface ProcessNowPurchaseSubscriptionOptions {
  billingOrganization: BillingOrganization;
  billingMethodNice: BillingMethodNiceBase;
  data: BillingSubscriptionPlanData;
  source: BillingSubscriptionPlanSource | null;
  couponResult: ResolveCouponResultSuccess;
  totalPrice: number;
  discountedAmount: number;
  previewResponse: GetBillingSubscriptionPreviewResponse;
  dateTimes: CalculatePurchaseSubscriptionDateTimesResultSuccess;
  planHistory: BillingSubscriptionPlanHistoryData | null;
}

export async function processNowPurchaseSubscription(
  context: RetrySerializeContext,
  billingMethodNiceCaller: BillingMethodNiceCaller,
  options: ProcessNowPurchaseSubscriptionOptions,
): Promise<CreatePurchaseSubscriptionResponse> {
  const { manager } = context;
  const { billingOrganization, billingMethodNice, totalPrice, couponResult, discountedAmount, data, source, previewResponse } = options;
  const { period, currency } = data;
  const { billingOrganizationId } = billingOrganization;

  const goodsName = 'Dogu Platform Subscription';
  const createPurchaseResult = await createPurchase(context, billingMethodNiceCaller, {
    billingMethodNiceId: billingMethodNice.billingMethodNiceId,
    // TODO: change goodsName
    goodsName,
    amount: totalPrice,
  });
  if (!createPurchaseResult.ok) {
    return {
      ok: false,
      resultCode: createPurchaseResult.resultCode,
      plan: null,
      license: null,
    };
  }

  const dateTimes = getPurchaseSubscriptionDateTimes(options.dateTimes, period);

  if (billingOrganization.currency === null) {
    billingOrganization.currency = currency;
  }
  switch (period) {
    case 'monthly': {
      billingOrganization.subscriptionMonthlyStartedAt = dateTimes.startedAt.date;
      billingOrganization.subscriptionMonthlyExpiredAt = dateTimes.expiredAt.date;
      break;
    }
    case 'yearly': {
      billingOrganization.subscriptionYearlyStartedAt = dateTimes.startedAt.date;
      billingOrganization.subscriptionYearlyExpiredAt = dateTimes.expiredAt.date;
      break;
    }
    default: {
      assertUnreachable(period);
    }
  }
  await manager.getRepository(BillingOrganization).save(billingOrganization);

  const useCouponResult = await useCoupon(context, { couponResult, billingOrganizationId, period: data.period });
  const createSubscriptionPlanInfoAndCouponResult = await createOrUpdateBillingSubscriptionPlanInfo(context, {
    billingOrganizationId: billingOrganization.billingOrganizationId,
    data,
    discountedAmount,
    useCouponResult,
    billingSubscriptionPlanSourceId: source?.billingSubscriptionPlanSourceId ?? null,
  });
  if (!createSubscriptionPlanInfoAndCouponResult.ok) {
    return {
      ok: false,
      resultCode: createSubscriptionPlanInfoAndCouponResult.resultCode,
      plan: null,
      license: null,
    };
  }

  const billingHistory = manager.getRepository(BillingHistory).create({
    billingHistoryId: v4(),
    billingOrganizationId: billingOrganization.billingOrganizationId,
    purchasedAt: new Date(),
    niceSubscribePaymentsResponse: createPurchaseResult.response as unknown as Record<string, unknown>,
    previewResponse: previewResponse as unknown as Record<string, unknown>,
    method: 'nice',
    goodsName,
    totalPrice,
    currency,
  });
  await manager.getRepository(BillingHistory).save(billingHistory);

  const planHistory = options.planHistory;
  if (planHistory) {
    const billingSubscriptionPlanHistory = manager.getRepository(BillingSubscriptionPlanHistory).create({
      billingSubscriptionPlanHistoryId: v4(),
      billingHistoryId: billingHistory.billingHistoryId,
      billingOrganizationId: billingOrganization.billingOrganizationId,
      ...planHistory,
    });
    await manager.getRepository(BillingSubscriptionPlanHistory).save(billingSubscriptionPlanHistory);
  }

  let license: CloudLicense | SelfHostedLicense | null = null;
  switch (billingOrganization.category) {
    case 'cloud':
      {
        const rv = await applyCloudLicense(context, { billingSubscriptionPlanInfo: createSubscriptionPlanInfoAndCouponResult.billingSubscriptionPlanInfo });
        if (rv.ok) {
          license = rv.license;
        }
      }
      break;
    case 'self-hosted':
      {
        // TODO: apply self-hosted license
      }
      break;
    default: {
      assertUnreachable(billingOrganization.category);
    }
  }

  const plan = createSubscriptionPlanInfoAndCouponResult.billingSubscriptionPlanInfo as BillingSubscriptionPlanInfoResponse;
  const monthlyExpiredAt = billingOrganization.subscriptionMonthlyExpiredAt;
  const yearlyExpiredAt = billingOrganization.subscriptionYearlyExpiredAt;

  switch (plan.period) {
    case 'monthly': {
      plan.monthlyExpiredAt = monthlyExpiredAt;
      break;
    }
    case 'yearly': {
      plan.yearlyExpiredAt = yearlyExpiredAt;
      break;
    }
    default: {
      assertUnreachable(plan.period);
    }
  }

  return {
    ok: true,
    resultCode: resultCode('ok'),
    plan,
    license,
  };
}

export interface ProcessNextPurchaseSubscriptionOptions {
  billingOrganization: BillingOrganization;
  data: BillingSubscriptionPlanData;
  totalPrice: number;
  discountedAmount: number;
  previewResponse: GetBillingSubscriptionPreviewResponse;
  dateTimes: CalculatePurchaseSubscriptionDateTimesResultSuccess;
}

export interface ProcessNextPurchaseSubscriptionResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface ProcessNextPurchaseSubscriptionResultSuccess {
  ok: true;
}

export type ProcessNextPurchaseSubscriptionResult = ProcessNextPurchaseSubscriptionResultFailure | ProcessNextPurchaseSubscriptionResultSuccess;

export async function processNextPurchaseSubscription(
  context: RetrySerializeContext,
  options: ProcessNextPurchaseSubscriptionOptions,
): Promise<ProcessNextPurchaseSubscriptionResult> {
  const { manager } = context;
  const { billingOrganization, data, totalPrice, discountedAmount, previewResponse, dateTimes } = options;
  const found = billingOrganization.billingSubscriptionPlanInfos?.find((plan) => plan.type === data.type);
  if (!found) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-not-found', {
        billingOrganizationId: billingOrganization.billingOrganizationId,
        type: data.type,
      }),
    };
  }

  if (found.state === 'unsubscribed') {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-unsubscribed', {
        billingOrganizationId: billingOrganization.billingOrganizationId,
        type: data.type,
      }),
    };
  }

  found.changeRequestedPeriod = data.period;
  found.changeRequestedOption = data.option;
  found.changeRequestedOriginPrice = data.originPrice;
  found.changeRequestedDiscountedAmount = discountedAmount;
  found.state = 'change-option-or-period-requested';
  await manager.getRepository(BillingSubscriptionPlanInfo).save(found);

  return {
    ok: true,
  };
}
