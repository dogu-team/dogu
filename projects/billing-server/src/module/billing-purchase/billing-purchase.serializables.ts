import {
  BillingMethodNiceBase,
  BillingResultCode,
  BillingSubscriptionPlanData,
  BillingSubscriptionPlanInfoResponse,
  BillingSubscriptionPlanPreviewDto,
  CouponPreviewResponse,
  CreatePurchaseSubscriptionResponse,
  GetBillingSubscriptionPreviewResponse,
  resultCode,
} from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { v4 } from 'uuid';
import { createExpiredAt, NormalizedDateTime } from '../../date-time-utils';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { RetrySerializeContext } from '../../db/utils';
import { parseCoupon } from '../billing-coupon/billing-coupon.serializables';
import { calculateCouponFactor, resolveCoupon, ResolveCouponResult } from '../billing-coupon/billing-coupon.utils';
import { BillingMethodNiceCaller } from '../billing-method/billing-method-nice.caller';
import { createPurchase } from '../billing-method/billing-method-nice.serializables';
import { createOrUpdateBillingSubscriptionPlanInfoAndCoupon } from '../billing-subscription-plan-info/billing-subscription-plan-info.serializables';
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
  resolveCouponResult: ResolveCouponResult;
  billingSubscriptionPlanData: BillingSubscriptionPlanData;
  billingSubscriptionPlanSource: BillingSubscriptionPlanSource | null;
  needPurchase: boolean;
  totalPrice: number;
  discountedAmount: number;
  now: Date;
  dateTimes: CalculatePurchaseSubscriptionDateTimesResultSuccess;
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
  const dateTimes = calculatePurchaseSubscriptionDateTimesResult;

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

  const resolveCouponResult = resolveCoupon({
    billingSubscriptionPlanInfo: foundInfo,
    newCoupon,
    isChangePeriod: foundInfo !== undefined && ((foundInfo.period === 'monthly' && data.period === 'yearly') || (foundInfo.period === 'yearly' && data.period === 'monthly')),
  });
  const { coupon } = resolveCouponResult;

  const { firstCouponFactor, secondCouponFactor } = calculateCouponFactor({
    coupon,
    period: data.period,
  });

  if (foundInfo === undefined) {
    const totalPrice = Math.floor(data.originPrice * firstCouponFactor);
    const nextPurchaseTotalPrice = Math.floor(data.originPrice * secondCouponFactor);
    const discountedAmount = data.originPrice - totalPrice;
    const couponPreviewResponse: CouponPreviewResponse | null = newCoupon
      ? {
          ...newCoupon,
          discountedAmount,
        }
      : null;

    return {
      ok: true,
      previewResponse: {
        ok: true,
        resultCode: resultCode('ok'),
        totalPrice,
        tax: 0,
        nextPurchaseTotalPrice,
        nextPurchasedAt: getPurchaseSubscriptionDateTimes(dateTimes, data.period).expiredAt.date,
        subscriptionPlan: data,
        elapsedPlans: [],
        remainingPlans: [],
        coupon: couponPreviewResponse,
      },
      billingSubscriptionPlanData: data,
      billingSubscriptionPlanSource: source,
      resolveCouponResult,
      discountedAmount,
      totalPrice,
      now,
      needPurchase: true,
      dateTimes,
    };
  } else {
    const processNowPurchaseReturn = (): ProcessPurchaseSubscriptionPreviewResult => {
      const currentPurchaseAmount = data.originPrice * firstCouponFactor;
      const discountedAmount = data.originPrice - currentPurchaseAmount;
      const couponPreviewResponse: CouponPreviewResponse | null = newCoupon
        ? {
            ...newCoupon,
            discountedAmount,
          }
        : null;

      const calculateElapsedPlanResult = calculateElapsedPlan({
        data,
        discountedAmount,
        dateTimes: getPurchaseSubscriptionDateTimes(dateTimes, data.period),
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
        dateTimes: getPurchaseSubscriptionDateTimes(dateTimes, data.period),
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
      const nextPurchasedAt = getPurchaseSubscriptionDateTimes(dateTimes, data.period).expiredAt.date;
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
          elapsedPlans: [elapsedPlan],
          remainingPlans: [remainingPlan],
        },
        billingSubscriptionPlanData: data,
        billingSubscriptionPlanSource: source,
        resolveCouponResult,
        discountedAmount,
        totalPrice,
        now,
        needPurchase: true,
        dateTimes,
      };
    };

    const processNextPurchaseReturn = (): ProcessPurchaseSubscriptionPreviewResult => {
      const nextPurchaseAmount = Math.floor(data.originPrice * firstCouponFactor);
      const discountedAmount = data.originPrice - nextPurchaseAmount;
      const couponPreviewResponse: CouponPreviewResponse | null = newCoupon
        ? {
            ...newCoupon,
            discountedAmount,
          }
        : null;

      const nextPurchasedAt = getPurchaseSubscriptionDateTimes(dateTimes, data.period).expiredAt.date;
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
        billingSubscriptionPlanData: data,
        billingSubscriptionPlanSource: source,
        resolveCouponResult,
        discountedAmount: 0,
        totalPrice: 0,
        now,
        needPurchase: false,
        dateTimes,
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
    } else if (foundInfo.period === 'monthly' && data.period === 'monthly') {
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

export interface ProcessPurchaseSubscriptionOptions {
  billingOrganization: BillingOrganization;
  billingMethodNice: BillingMethodNiceBase;
  billingSubscriptionPlanData: BillingSubscriptionPlanData;
  billingSubscriptionPlanSource: BillingSubscriptionPlanSource | null;
  resolveCouponResult: ResolveCouponResult;
  totalPrice: number;
  discountedAmount: number;
  previewResponse: GetBillingSubscriptionPreviewResponse;
  now: Date;
  dateTimes: CalculatePurchaseSubscriptionDateTimesResultSuccess;
}

export async function processPurchaseSubscription(
  context: RetrySerializeContext,
  billingMethodNiceCaller: BillingMethodNiceCaller,
  options: ProcessPurchaseSubscriptionOptions,
): Promise<CreatePurchaseSubscriptionResponse> {
  const { manager } = context;
  const {
    billingOrganization,
    billingMethodNice,
    totalPrice,
    resolveCouponResult,
    discountedAmount,
    billingSubscriptionPlanData,
    billingSubscriptionPlanSource,
    previewResponse,
    now,
  } = options;
  const createPurchaseResult = await createPurchase(context, billingMethodNiceCaller, {
    billingMethodNiceId: billingMethodNice.billingMethodNiceId,
    // TODO: change to goodsName
    goodsName: 'Dogu Technologies',
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

  // update billingOrganization
  if (billingOrganization.currency === null) {
    billingOrganization.currency = billingSubscriptionPlanData.currency;
  }
  switch (billingSubscriptionPlanData.period) {
    case 'monthly': {
      if (billingOrganization.subscriptionMonthlyExpiredAt === null) {
        // new monthly subscription
        billingOrganization.subscriptionMonthlyStartedAt = now;
      } else {
        // extend monthly subscription
        billingOrganization.subscriptionMonthlyStartedAt = billingOrganization.subscriptionMonthlyExpiredAt;
      }

      billingOrganization.subscriptionMonthlyExpiredAt = createExpiredAt(
        NormalizedDateTime.fromDate(billingOrganization.subscriptionMonthlyStartedAt),
        billingSubscriptionPlanData.period,
      ).date;
      break;
    }
    case 'yearly': {
      if (billingOrganization.subscriptionYearlyExpiredAt === null) {
        // new yearly subscription
        billingOrganization.subscriptionYearlyStartedAt = now;
      } else {
        // extend yearly subscription
        billingOrganization.subscriptionYearlyStartedAt = billingOrganization.subscriptionYearlyExpiredAt;
      }

      billingOrganization.subscriptionYearlyExpiredAt = createExpiredAt(
        NormalizedDateTime.fromDate(billingOrganization.subscriptionYearlyStartedAt),
        billingSubscriptionPlanData.period,
      ).date;
      break;
    }
    default: {
      assertUnreachable(billingSubscriptionPlanData.period);
    }
  }
  await manager.getRepository(BillingOrganization).save(billingOrganization);

  const createSubscriptionPlanInfoAndCouponResult = await createOrUpdateBillingSubscriptionPlanInfoAndCoupon(context, {
    billingOrganizationId: billingOrganization.billingOrganizationId,
    billingSubscriptionPlanData,
    discountedAmount,
    resolveCouponResult,
    billingSubscriptionPlanSourceId: billingSubscriptionPlanSource?.billingSubscriptionPlanSourceId ?? null,
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
  });
  await manager.getRepository(BillingHistory).save(billingHistory);

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
