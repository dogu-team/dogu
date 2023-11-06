import {
  BillingMethodNiceBase,
  BillingResultCode,
  BillingSubscriptionPlanData,
  BillingSubscriptionPlanPreviewDto,
  CouponPreviewResponse,
  CreatePurchaseSubscriptionResponse,
  GetBillingSubscriptionPreviewResponse,
  resultCode,
} from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { v4 } from 'uuid';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { RetrySerializeContext } from '../../db/utils';
import { parseCoupon } from '../billing-coupon/billing-coupon.serializables';
import { calculateCouponFactor } from '../billing-coupon/billing-coupon.utils';
import { BillingMethodNiceCaller } from '../billing-method/billing-method-nice.caller';
import { createPurchase } from '../billing-method/billing-method-nice.serializables';
import { createOrUpdateBillingSubscriptionPlanInfoAndCoupon } from '../billing-subscription-plan-info/billing-subscription-plan-info.serializables';
import { parseBillingSubscriptionPlanData } from '../billing-subscription-source/billing-subscription-source.serializables';
import { applyCloudLicense } from '../cloud-license/cloud-license.serializables';
import { calculateElapsedPlan, calculateRemainingPlan, createExpiredAt, createStartedAt, resolveCurrency } from './billing-purchase.utils';

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
  newCoupon: BillingCoupon | null;
  oldCoupon: BillingCoupon | null;
  billingSubscriptionPlanData: BillingSubscriptionPlanData;
  billingSubscriptionPlanSource: BillingSubscriptionPlanSource | null;
  totalPrice: number;
  discountedAmount: number;
  now: Date;
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
      resultCode: resultCode('subscription-plan-category-not-matched'),
    };
  }

  const { billingOrganizationId, organizationId } = billingOrganization;
  const currency = resolveCurrency(billingOrganization, dto.currency);

  const billingSubscriptionPlanInfos = billingOrganization.billingSubscriptionPlanInfos ?? [];
  if (billingSubscriptionPlanInfos.length > 0 && billingSubscriptionPlanInfos.some((plan) => plan.currency !== currency)) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-currency-not-matched'),
    };
  }

  const parseSubscriptionPlanDataResult = await parseBillingSubscriptionPlanData({
    context, //
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
  const { billingSubscriptionPlanData, billingSubscriptionPlanSource } = parseSubscriptionPlanDataResult;

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
  const newCoupon = parseCouponResult.coupon;

  const now = new Date();
  const nextPurchasedAt = createExpiredAt(createStartedAt(now), dto.period);

  const foundBillingSubscriptionPlanInfo = billingSubscriptionPlanInfos.find((plan) => plan.type === billingSubscriptionPlanData.type);
  if (foundBillingSubscriptionPlanInfo === undefined) {
    const { couponFactor, nextCouponFactor } = calculateCouponFactor({
      coupon: newCoupon,
      period: dto.period,
    });
    const currentPurchaseAmount = Math.floor(billingSubscriptionPlanData.originPrice * couponFactor);
    const currentDiscountedAmount = billingSubscriptionPlanData.originPrice - currentPurchaseAmount;
    const couponPreviewResponse: CouponPreviewResponse | null = newCoupon
      ? {
          ...newCoupon,
          discountedAmount: currentDiscountedAmount,
        }
      : null;

    const nextPurchaseAmount = Math.floor(billingSubscriptionPlanData.originPrice * nextCouponFactor);

    const totalPrice = currentPurchaseAmount;
    return {
      ok: true,
      previewResponse: {
        ok: true,
        resultCode: resultCode('ok'),
        totalPrice,
        tax: 0,
        nextPurchaseTotalPrice: nextPurchaseAmount,
        nextPurchasedAt,
        subscriptionPlan: billingSubscriptionPlanData,
        elapsedPlans: [],
        remainingPlans: [],
        coupon: couponPreviewResponse,
      },
      billingSubscriptionPlanData,
      billingSubscriptionPlanSource,
      newCoupon,
      oldCoupon: null,
      discountedAmount: currentDiscountedAmount,
      totalPrice,
      now,
    };
  } else {
    const upgradePlanOption = foundBillingSubscriptionPlanInfo.option < billingSubscriptionPlanData.option;
    const upgradePlanPeriod = foundBillingSubscriptionPlanInfo.period === 'monthly' && billingSubscriptionPlanData.period === 'yearly';

    let oldCoupon: BillingCoupon | null = null;
    if (newCoupon === null && upgradePlanOption) {
      if (foundBillingSubscriptionPlanInfo.billingCoupon?.yearlyDiscountPercent !== null) {
        oldCoupon = foundBillingSubscriptionPlanInfo.billingCoupon ?? null;
      }
    }

    const coupon = newCoupon ?? oldCoupon ?? null;
    const { couponFactor, nextCouponFactor } = calculateCouponFactor({
      coupon,
      period: dto.period,
    });
    const currentPurchaseAmount = Math.floor(billingSubscriptionPlanData.originPrice * couponFactor);
    const currentDiscountedAmount = billingSubscriptionPlanData.originPrice - currentPurchaseAmount;
    const couponPreviewResponse: CouponPreviewResponse | null = coupon
      ? {
          ...coupon,
          discountedAmount: currentDiscountedAmount,
        }
      : null;

    const nextPurchaseAmount = Math.floor(billingSubscriptionPlanData.originPrice * nextCouponFactor);

    if (upgradePlanOption || upgradePlanPeriod) {
      const calculateRemaningPlanResult = calculateRemainingPlan({
        billingOrganization,
        foundBillingSubscriptionPlanInfo,
        period: billingSubscriptionPlanData.period,
        now,
      });
      if (!calculateRemaningPlanResult.ok) {
        return {
          ok: false,
          resultCode: calculateRemaningPlanResult.resultCode,
        };
      }

      const { remainingPlan } = calculateRemaningPlanResult;

      const calculateElapsedPlanResult = calculateElapsedPlan({
        billingOrganization,
        billingSubscriptionPlanData,
        discountedAmount: currentDiscountedAmount,
        now,
      });
      if (!calculateElapsedPlanResult.ok) {
        return {
          ok: false,
          resultCode: calculateElapsedPlanResult.resultCode,
        };
      }

      const { elapsedPlan } = calculateElapsedPlanResult;
      const totalPrice = Math.floor(currentPurchaseAmount - remainingPlan.remainingDiscountedAmount - elapsedPlan.elapsedDiscountedAmount);
      return {
        ok: true,
        previewResponse: {
          ok: true,
          resultCode: resultCode('ok'),
          totalPrice,
          tax: 0,
          nextPurchaseTotalPrice: nextPurchaseAmount,
          nextPurchasedAt,
          subscriptionPlan: billingSubscriptionPlanData,
          coupon: couponPreviewResponse,
          elapsedPlans: [elapsedPlan],
          remainingPlans: [remainingPlan],
        },
        billingSubscriptionPlanData,
        billingSubscriptionPlanSource,
        newCoupon,
        oldCoupon,
        discountedAmount: currentDiscountedAmount,
        totalPrice,
        now,
      };
    } else {
      return {
        ok: false,
        resultCode: resultCode('subscription-plan-not-upgrade'),
      };
    }
  }
}

export interface ProcessPurchaseSubscriptionOptions {
  billingOrganization: BillingOrganization;
  billingMethodNice: BillingMethodNiceBase;
  billingSubscriptionPlanData: BillingSubscriptionPlanData;
  billingSubscriptionPlanSource: BillingSubscriptionPlanSource | null;
  newCoupon: BillingCoupon | null;
  oldCoupon: BillingCoupon | null;
  totalPrice: number;
  discountedAmount: number;
  previewResponse: GetBillingSubscriptionPreviewResponse;
  now: Date;
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
    newCoupon,
    oldCoupon,
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
    };
  }

  // update billingOrganization
  if (billingOrganization.currency === null) {
    billingOrganization.currency = billingSubscriptionPlanData.currency;
  }
  switch (billingSubscriptionPlanData.period) {
    case 'monthly': {
      if (billingOrganization.monthlyExpiredAt === null) {
        billingOrganization.monthlyStartedAt = createStartedAt(now);
      } else {
        billingOrganization.monthlyStartedAt = billingOrganization.monthlyExpiredAt;
      }

      billingOrganization.monthlyExpiredAt = createExpiredAt(billingOrganization.monthlyStartedAt, billingSubscriptionPlanData.period);
      break;
    }
    case 'yearly': {
      if (billingOrganization.yearlyExpiredAt === null) {
        billingOrganization.yearlyStartedAt = createStartedAt(now);
      } else {
        billingOrganization.yearlyStartedAt = billingOrganization.yearlyExpiredAt;
      }

      billingOrganization.yearlyExpiredAt = createExpiredAt(billingOrganization.yearlyStartedAt, billingSubscriptionPlanData.period);
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
    newCoupon,
    oldCoupon,
    billingSubscriptionPlanSourceId: billingSubscriptionPlanSource?.billingSubscriptionPlanSourceId ?? null,
  });
  if (!createSubscriptionPlanInfoAndCouponResult.ok) {
    return {
      ok: false,
      resultCode: createSubscriptionPlanInfoAndCouponResult.resultCode,
    };
  }

  const billingHistory = manager.getRepository(BillingHistory).create({
    billingHistoryId: v4(),
    billingOrganizationId: billingOrganization.billingOrganizationId,
    purchasedAt: new Date(),
    niceSubscribePaymentsResponse: createPurchaseResult.response as unknown as Record<string, unknown>,
    previewResponse: previewResponse as unknown as Record<string, unknown>,
  });
  await manager.getRepository(BillingHistory).save(billingHistory);

  switch (billingOrganization.category) {
    case 'cloud':
      {
        await applyCloudLicense(context, { billingSubscriptionPlanInfo: createSubscriptionPlanInfoAndCouponResult.billingSubscriptionPlanInfo });
      }
      break;
    case 'self-hosted':
      {
        // noop
      }
      break;
    default: {
      assertUnreachable(billingOrganization.category);
    }
  }

  return {
    ok: true,
    resultCode: resultCode('ok'),
  };
}
