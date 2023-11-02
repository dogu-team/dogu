import {
  BillingCategory,
  BillingCouponBase,
  BillingCurrency,
  BillingPeriod,
  BillingResultCode,
  BillingSubscriptionPlanDto,
  BillingSubscriptionPlanInfo,
  BillingSubscriptionPlanMap,
  BillingSubscriptionPlanPrice,
  BillingSubscriptionPlanPriceMap,
  BillingSubscriptionPlanSourceData,
  BillingSubscriptionPlanType,
  GetBillingSubscriptionPreviewResponse,
  resultCode,
} from '@dogu-private/console';
import _ from 'lodash';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { RetrySerializeContext } from '../../db/utils';
import { validateCoupon } from '../billing-coupon/billing-coupon.serializables';
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

export interface ParseSubscriptionPlanSourceResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface ParseSubscriptionPlanSourceResultSuccess {
  ok: true;
  resultCode: BillingResultCode;
  subscriptionPlanSource: BillingSubscriptionPlanSourceData;
}

export type ParseSubscriptionPlanSourceResult = ParseSubscriptionPlanSourceResultFailure | ParseSubscriptionPlanSourceResultSuccess;

export async function parseSubscriptionPlanSource(
  context: RetrySerializeContext,
  billingOrganizationId: string,
  type: BillingSubscriptionPlanType,
  category: BillingCategory,
  option: number,
  currency: BillingCurrency,
  period: BillingPeriod,
): Promise<ParseSubscriptionPlanSourceResult> {
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
      subscriptionPlanSource: billingSubscriptionPlanSource,
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
    subscriptionPlanSource: {
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

export async function parseCoupon(context: RetrySerializeContext, organizationId: string, couponCode: string | undefined): Promise<ParseCouponResult> {
  if (couponCode === undefined) {
    return {
      ok: true,
      resultCode: resultCode('coupon-null-argument'),
      coupon: null,
    };
  }

  const validateResult = await validateCoupon(context, { organizationId, code: couponCode });
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
  billingSubscriptionPlan: BillingSubscriptionPlanDto;
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

  const { billingOrganizationId, organizationId, firstPurchasedAt } = billingOrganization;
  const currency = resolveCurrency(billingOrganization, subscriptionPlan.currency);
  const subscriptionPlans = billingOrganization.billingSubscriptionPlans ?? [];
  if (subscriptionPlans.length > 0 && subscriptionPlans.some((plan) => plan.currency !== currency)) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-currency-not-matched'),
    };
  }

  const parseSubscriptionPlanSourceResult = await parseSubscriptionPlanSource(
    context, //
    billingOrganizationId,
    subscriptionPlan.type,
    subscriptionPlan.category,
    subscriptionPlan.option,
    currency,
    subscriptionPlan.period,
  );
  if (!parseSubscriptionPlanSourceResult.ok) {
    return {
      ok: parseSubscriptionPlanSourceResult.ok,
      resultCode: parseSubscriptionPlanSourceResult.resultCode,
    };
  }

  const { subscriptionPlanSource } = parseSubscriptionPlanSourceResult;
  const parseCouponResult = await parseCoupon(context, organizationId, subscriptionPlan.couponCode);
  if (!parseCouponResult.ok) {
    return {
      ok: parseCouponResult.ok,
      resultCode: parseCouponResult.resultCode,
    };
  }

  const { coupon } = parseCouponResult;
  const normalizedCouponFactor = calculateCouponFactor(coupon, subscriptionPlan.period);
  const normalizedNextCouponFactor = calculateNextCouponFactor(coupon, subscriptionPlan.period);
  const currentSubscriptionPlanPrice = subscriptionPlanSource.originPrice * normalizedCouponFactor;

  const isSubscribing = subscriptionPlans.length > 0;
  if (!isSubscribing) {
    const totalPrice = currentSubscriptionPlanPrice;
    return {
      ok: true,
      resultCode: resultCode('ok'),
      totalPrice,
      tax: 0,
      nextPurchaseTotalPrice: subscriptionPlanSource.originPrice,
      nextPurchaseAt: calculateNextPurchaseAt(billingOrganization, subscriptionPlan.period),
      subscriptionPlan: subscriptionPlanSource,
      coupon,
      elapsedPlans: [],
      remainingPlans: [],
    };
  } else {
    const toChangeSubscriptionPlan = subscriptionPlans.find((plan) => plan.type === subscriptionPlan.type);
    if (!toChangeSubscriptionPlan) {
      const totalPrice = currentSubscriptionPlanPrice;
      const nextPurchaseAt = calculateNextPurchaseAt(billingOrganization, subscriptionPlan.period);
      const nextPurchaseTotalPrice =
        subscriptionPlanSource.originPrice * normalizedNextCouponFactor + calculateNextPurchaseTotalPriceFromSubscriptionPlans(subscriptionPlans, subscriptionPlan.period);

      return {
        ok: true,
        resultCode: resultCode('ok'),
        totalPrice,
        tax: 0,
        nextPurchaseTotalPrice,
        nextPurchaseAt,
        subscriptionPlan: subscriptionPlanSource,
        coupon,
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
            totalPrice,
            tax: 0,
            nextPurchaseTotalPrice: subscriptionPlanSource.originPrice,
            nextPurchaseAt,
            subscriptionPlan: subscriptionPlanSource,
            coupon,
            elapsedPlans: [
              {
                category: subscriptionPlanSource.category,
                type: subscriptionPlanSource.type,
                option: subscriptionPlanSource.option,
                period: subscriptionPlanSource.period,
                currency: subscriptionPlanSource.currency,
                amount: elapsedAmount,
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
                amount: remainingAmount,
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
