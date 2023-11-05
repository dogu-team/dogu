import {
  BillingCategory,
  BillingCouponBase,
  BillingCurrency,
  BillingMethodNiceBase,
  BillingPeriod,
  BillingResultCode,
  BillingSubscriptionPlanData,
  BillingSubscriptionPlanInfo,
  BillingSubscriptionPlanMap,
  BillingSubscriptionPlanPreviewDto,
  BillingSubscriptionPlanPrice,
  BillingSubscriptionPlanPriceMap,
  BillingSubscriptionPlanType,
  CouponPreviewResponse,
  CreatePurchaseSubscriptionResponse,
  GetBillingSubscriptionPreviewResponse,
  GetBillingSubscriptionPreviewResponseSuccess,
  resultCode,
} from '@dogu-private/console';
import _ from 'lodash';
import { v4 } from 'uuid';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPurchaseHistory } from '../../db/entity/billing-purchase-history.entity';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { RetrySerializeContext } from '../../db/utils';
import { validateCoupon } from '../billing-coupon/billing-coupon.serializables';
import { BillingMethodNiceCaller } from '../billing-method/billing-method-nice.caller';
import { createPurchase } from '../billing-method/billing-method-nice.serializables';
import { registerUsedCoupon } from '../billing-organization/billing-organization.serializables';
import { createSubscriptionPlan, unsubscribeRemainingSubscriptionPlans } from '../billing-subscription-plan/billing-subscription-plan.serializables';
import {
  calculateCouponFactor,
  calculateElapsedDays,
  calculateNextCouponFactor,
  calculateNextPurchaseAt,
  calculateNextPurchaseTotalPriceFromSubscriptionPlans,
  calculatePeriodDays,
  calculateRemainingDays,
  getLastPurchasedAt,
  resolveCurrency,
} from './billing-purchase.utils';

export interface ParseSubscriptionPlanDataResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface ParseSubscriptionPlanDataResultSuccess {
  ok: true;
  resultCode: BillingResultCode;
  subscriptionPlanData: BillingSubscriptionPlanData;
}

export type ParseSubscriptionPlanDataResult = ParseSubscriptionPlanDataResultFailure | ParseSubscriptionPlanDataResultSuccess;

export async function parseSubscriptionPlanData(
  context: RetrySerializeContext,
  billingOrganizationId: string,
  type: BillingSubscriptionPlanType,
  category: BillingCategory,
  option: number,
  currency: BillingCurrency,
  period: BillingPeriod,
): Promise<ParseSubscriptionPlanDataResult> {
  const { manager } = context;
  const billingSubscriptionPlanSource = await manager.getRepository(BillingSubscriptionPlanSource).findOne({
    where: {
      billingOrganizationId,
      type,
      category,
      option,
      currency,
      period,
    },
  });

  if (billingSubscriptionPlanSource) {
    return {
      ok: true,
      resultCode: resultCode('ok'),
      subscriptionPlanData: {
        type: billingSubscriptionPlanSource.type,
        category: billingSubscriptionPlanSource.category,
        option: billingSubscriptionPlanSource.option,
        currency: billingSubscriptionPlanSource.currency,
        period: billingSubscriptionPlanSource.period,
        originPrice: billingSubscriptionPlanSource.originPrice,
      },
    };
  }

  // validate subscription plan type
  const billingSubscriptionPlanInfo = _.get(BillingSubscriptionPlanMap, type) as BillingSubscriptionPlanInfo | undefined;
  if (!billingSubscriptionPlanInfo) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-type-not-found'),
    };
  }

  if (billingSubscriptionPlanInfo.category !== category) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-category-not-matched'),
    };
  }

  const billingSubscriptionPlanPriceMap = _.get(billingSubscriptionPlanInfo.optionMap, option) as BillingSubscriptionPlanPriceMap | undefined;
  if (!billingSubscriptionPlanPriceMap) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-option-not-found'),
    };
  }

  const billingSubscriptionPlanPrice = _.get(billingSubscriptionPlanPriceMap, currency) as BillingSubscriptionPlanPrice | undefined;
  if (!billingSubscriptionPlanPrice) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-currency-not-found'),
    };
  }

  const originPrice = _.get(billingSubscriptionPlanPrice, period) as number | undefined;
  if (originPrice === undefined) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-period-not-found'),
    };
  }

  return {
    ok: true,
    resultCode: resultCode('ok'),
    subscriptionPlanData: {
      type,
      category,
      option,
      currency,
      period,
      originPrice,
    },
  };
}

export interface ParseCouponResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface ParseCouponResultSuccess {
  ok: true;
  resultCode: BillingResultCode;
  coupon: BillingCouponBase | null;
}

export type ParseCouponResult = ParseCouponResultFailure | ParseCouponResultSuccess;

export async function parseCoupon(context: RetrySerializeContext, organizationId: string, couponCode: string | undefined, period: BillingPeriod): Promise<ParseCouponResult> {
  if (couponCode === undefined) {
    return {
      ok: true,
      resultCode: resultCode('coupon-null-argument'),
      coupon: null,
    };
  }

  const validateResult = await validateCoupon(context, { organizationId, code: couponCode, period });
  if (!validateResult.ok) {
    return {
      ok: false,
      resultCode: validateResult.resultCode,
    };
  }

  return {
    ok: true,
    resultCode: resultCode('ok'),
    coupon: validateResult.coupon,
  };
}

export interface GetSubscriptionPreviewDto {
  billingOrganization: BillingOrganization;
  billingSubscriptionPlan: BillingSubscriptionPlanPreviewDto;
}

export async function getSubscriptionPreview(context: RetrySerializeContext, dto: GetSubscriptionPreviewDto): Promise<GetBillingSubscriptionPreviewResponse> {
  const { manager } = context;
  const { billingOrganization } = dto;
  const subscriptionPlan = dto.billingSubscriptionPlan;
  if (billingOrganization.category !== subscriptionPlan.category) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-category-not-matched'),
    };
  }

  const { billingOrganizationId, organizationId } = billingOrganization;
  const currency = resolveCurrency(billingOrganization, subscriptionPlan.currency);
  const subscriptionPlans = billingOrganization.billingSubscriptionPlans ?? [];
  if (subscriptionPlans.length > 0 && subscriptionPlans.some((plan) => plan.currency !== currency)) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-currency-not-matched'),
    };
  }

  const parseSubscriptionPlanDataResult = await parseSubscriptionPlanData(
    context, //
    billingOrganizationId,
    subscriptionPlan.type,
    subscriptionPlan.category,
    subscriptionPlan.option,
    currency,
    subscriptionPlan.period,
  );
  if (!parseSubscriptionPlanDataResult.ok) {
    return {
      ok: parseSubscriptionPlanDataResult.ok,
      resultCode: parseSubscriptionPlanDataResult.resultCode,
    };
  }

  const { subscriptionPlanData } = parseSubscriptionPlanDataResult;
  const parseCouponResult = await parseCoupon(context, organizationId, subscriptionPlan.couponCode, subscriptionPlan.period);
  if (!parseCouponResult.ok) {
    return {
      ok: parseCouponResult.ok,
      resultCode: parseCouponResult.resultCode,
    };
  }

  const { coupon } = parseCouponResult;
  const normalizedCouponFactor = calculateCouponFactor(coupon, subscriptionPlan.period);
  const normalizedNextCouponFactor = calculateNextCouponFactor(coupon, subscriptionPlan.period);
  const currentSubscriptionPlanPrice = subscriptionPlanData.originPrice * normalizedCouponFactor;
  const couponResponse: CouponPreviewResponse | null = coupon
    ? {
        ...coupon,
        discountAmount: Math.floor(subscriptionPlanSource.originPrice - currentSubscriptionPlanPrice),
      }
    : null;
  const currentSubscriptionPlanPrice = subscriptionPlanData.originPrice * normalizedCouponFactor;

  const isSubscribing = subscriptionPlans.length > 0;
  if (!isSubscribing) {
    const totalPrice = currentSubscriptionPlanPrice;
    return {
      ok: true,
      resultCode: resultCode('ok'),
      totalPrice: Math.floor(totalPrice),
      tax: 0,
      nextPurchaseTotalPrice: Math.floor(subscriptionPlanData.originPrice),
      nextPurchaseAt: calculateNextPurchaseAt(billingOrganization, subscriptionPlan.period),
      coupon: couponResponse,
      subscriptionPlan: subscriptionPlanData,
      elapsedPlans: [],
      remainingPlans: [],
    };
  } else {
    const toChangeSubscriptionPlan = subscriptionPlans.find((plan) => plan.type === subscriptionPlan.type);
    if (!toChangeSubscriptionPlan) {
      const totalPrice = currentSubscriptionPlanPrice;
      const nextPurchaseAt = calculateNextPurchaseAt(billingOrganization, subscriptionPlan.period);
      const nextPurchaseTotalPrice =
        subscriptionPlanData.originPrice * normalizedNextCouponFactor + calculateNextPurchaseTotalPriceFromSubscriptionPlans(subscriptionPlans, subscriptionPlan.period);

      return {
        ok: true,
        resultCode: resultCode('ok'),
        totalPrice: Math.floor(totalPrice),
        tax: 0,
        nextPurchaseTotalPrice: Math.floor(nextPurchaseTotalPrice),
        nextPurchaseAt,
        coupon: couponResponse,
        subscriptionPlan: subscriptionPlanData,
        elapsedPlans: [],
        remainingPlans: [],
      };
    } else {
      const upgradePlanOption = toChangeSubscriptionPlan.option < subscriptionPlan.option;
      const downgradePlanOption = toChangeSubscriptionPlan.option > subscriptionPlan.option;
      const noChangePlanOption = toChangeSubscriptionPlan.option === subscriptionPlan.option;
      const upgradePlanPeriod = toChangeSubscriptionPlan.period === 'monthly' && subscriptionPlan.period === 'yearly';
      const downgradePlanPeriod = toChangeSubscriptionPlan.period === 'yearly' && subscriptionPlan.period === 'monthly';
      const noChangePlanPeriod = toChangeSubscriptionPlan.period === subscriptionPlan.period;

      if (upgradePlanOption) {
        if (upgradePlanPeriod) {
          throw new Error('not implemented');
        } else if (downgradePlanPeriod) {
          throw new Error('not implemented');
        } else if (noChangePlanPeriod) {
          const nextPurchaseAt = calculateNextPurchaseAt(billingOrganization, subscriptionPlan.period);
          const remainingDays = calculateRemainingDays(subscriptionPlan.period, nextPurchaseAt);
          const periodDays = calculatePeriodDays(billingOrganization, subscriptionPlan.period, nextPurchaseAt);
          const lastPurchasedPrice = toChangeSubscriptionPlan.lastPurchasedPrice;
          const remainingAmount = (lastPurchasedPrice * remainingDays) / periodDays;

          const lastPurchasedAt = getLastPurchasedAt(billingOrganization, subscriptionPlan.period);
          if (lastPurchasedAt === null) {
            throw new Error('last purchased at must not be null');
          }

          const elapsedDays = calculateElapsedDays(subscriptionPlan.period, lastPurchasedAt);
          const elapsedAmount = (currentSubscriptionPlanPrice * elapsedDays) / periodDays;
          const totalPrice = remainingAmount + elapsedAmount + currentSubscriptionPlanPrice;

          // TODO: keep coupon?
          return {
            ok: true,
            resultCode: resultCode('ok'),
            totalPrice: Math.floor(totalPrice),
            tax: 0,
            nextPurchaseTotalPrice: Math.floor(subscriptionPlanData.originPrice),
            nextPurchaseAt,
            coupon: couponResponse,
            subscriptionPlan: subscriptionPlanData,
            elapsedPlans: [
              {
                category: subscriptionPlanData.category,
                type: subscriptionPlanData.type,
                option: subscriptionPlanData.option,
                period: subscriptionPlanData.period,
                currency: subscriptionPlanData.currency,
                amount: Math.floor(elapsedAmount),
                lastPurchasedAt,
              },
            ],
            remainingPlans: [
              {
                billingSubscriptionPlanId: toChangeSubscriptionPlan.billingSubscriptionPlanId,
                category: toChangeSubscriptionPlan.category,
                type: toChangeSubscriptionPlan.type,
                option: toChangeSubscriptionPlan.option,
                period: toChangeSubscriptionPlan.period,
                currency: toChangeSubscriptionPlan.currency,
                amount: Math.floor(remainingAmount),
                nextPurchaseAt,
              },
            ],
          };
        } else {
          throw new Error('must not be reachable');
        }
      } else if (downgradePlanOption) {
        if (upgradePlanPeriod) {
          throw new Error('not implemented');
        } else if (downgradePlanPeriod) {
          throw new Error('not implemented');
        } else if (noChangePlanPeriod) {
          throw new Error('not implemented');
        } else {
          throw new Error('must not be reachable');
        }
      } else if (noChangePlanOption) {
        if (upgradePlanPeriod) {
          throw new Error('not implemented');
        } else if (downgradePlanPeriod) {
          throw new Error('not implemented');
        } else if (noChangePlanPeriod) {
          return {
            ok: false,
            resultCode: resultCode('subscription-plan-duplicated'),
          };
        } else {
          throw new Error('must not be reachable');
        }
      } else {
        throw new Error('must not be reachable');
      }
    }
  }
}

export interface ProcessPurchaseDto {
  billingOrganization: BillingOrganization;
  billingMethodNice: BillingMethodNiceBase;
  billingSubscriptionPreview: GetBillingSubscriptionPreviewResponseSuccess;
}

export async function processPurchaseSubscription(
  context: RetrySerializeContext,
  billingMethodNiceCaller: BillingMethodNiceCaller,
  dto: ProcessPurchaseDto,
): Promise<CreatePurchaseSubscriptionResponse> {
  const { manager } = context;
  const { billingOrganization, billingMethodNice, billingSubscriptionPreview } = dto;
  const createPurchaseResult = await createPurchase(context, billingMethodNiceCaller, {
    billingMethodNiceId: billingMethodNice.billingMethodNiceId,
    period: billingSubscriptionPreview.subscriptionPlan.period,
    amount: billingSubscriptionPreview.totalPrice,
    // TODO: change to goodsName
    goodsName: 'dogu technologies',
  });
  if (!createPurchaseResult.ok) {
    return {
      ok: false,
      resultCode: createPurchaseResult.resultCode,
    };
  }

  const createSubscriptionPlanResult = await createSubscriptionPlan(context, {
    billingOrganizationId: billingOrganization.billingOrganizationId,
    subscriptionPlanSourceData: billingSubscriptionPreview.subscriptionPlan,
    lastPurchasedPrice: billingSubscriptionPreview.totalPrice,
  });
  if (!createSubscriptionPlanResult.ok) {
    return {
      ok: false,
      resultCode: createSubscriptionPlanResult.resultCode,
    };
  }

  const remainingSubscriptionPlanIds = billingSubscriptionPreview.remainingPlans.map((plan) => plan.billingSubscriptionPlanId);
  await unsubscribeRemainingSubscriptionPlans(context, remainingSubscriptionPlanIds);

  if (billingSubscriptionPreview.coupon) {
    await registerUsedCoupon(context, {
      billingOrganizationId: billingOrganization.billingOrganizationId,
      billingCouponId: billingSubscriptionPreview.coupon.billingCouponId,
    });
  }

  {
    const created = manager.getRepository(BillingPurchaseHistory).create({
      billingPurchaseHistoryId: v4(),
      billingOrganizationId: billingOrganization.billingOrganizationId,
      purchasedAt: new Date(),
      niceSubscribePaymentsResponse: createPurchaseResult.response as unknown as Record<string, unknown>,
    });
    await manager.getRepository(BillingPurchaseHistory).save(created);
  }

  return {
    ok: true,
    resultCode: resultCode('ok'),
  };
}
