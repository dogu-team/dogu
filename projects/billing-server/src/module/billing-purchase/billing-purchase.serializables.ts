import {
  BillingMethodNiceBase,
  BillingPeriod,
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
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { BillingSubscriptionPlanSource } from '../../db/entity/billing-subscription-plan-source.entity';
import { RetrySerializeContext } from '../../db/utils';
import { parseCoupon } from '../billing-coupon/billing-coupon.serializables';
import { calculateCouponFactor } from '../billing-coupon/billing-coupon.utils';
import { BillingMethodNiceCaller } from '../billing-method/billing-method-nice.caller';
import { createPurchase } from '../billing-method/billing-method-nice.serializables';
import { registerUsedCoupon } from '../billing-organization/billing-organization.serializables';
import { createSubscriptionPlanInfo } from '../billing-subscription-plan-info/billing-subscription-plan-info.serializables';
import {
  calculateNextPurchaseAmount,
  CalculateNextPurchaseAmountResultFailure,
  CalculateNextPurchaseAmountResultSuccess,
} from '../billing-subscription-plan-info/billing-subscription-plan-info.utils';
import { parseSubscriptionPlanData } from '../billing-subscription-source/billing-subscription-source.serializables';
import {
  calculateElapsedPlan,
  calculateLocalNextPurchaseDate,
  calculateRemainingPlan,
  createCalculationExpiredAt,
  createCalculationStartedAtFromNow,
  parseTimezoneOffset,
  resolveCurrency,
  resolveTimezoneOffset,
  TimezoneOffset,
} from './billing-purchase.utils';

export interface CalculateNextPurchaseTotalPriceOptions {
  subscriptionPlanInfos: BillingSubscriptionPlanInfo[];
  subscriptionPlanData: BillingSubscriptionPlanData;
  period: BillingPeriod;
  nextPlanPurchaseAmount: number;
}

export interface CalculateNextPurchaseTotalPriceResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CalculateNextPurchaseTotalPriceResultSuccess {
  ok: true;
  nextPurchaseTotalPrice: number;
}

export type CalculateNextPurchaseTotalPriceResult = CalculateNextPurchaseTotalPriceResultFailure | CalculateNextPurchaseTotalPriceResultSuccess;

export function calculateNextPurchaseTotalPrice(options: CalculateNextPurchaseTotalPriceOptions): CalculateNextPurchaseTotalPriceResult {
  const { subscriptionPlanInfos, subscriptionPlanData, period, nextPlanPurchaseAmount } = options;
  const otherRequestedPeriodInfos = subscriptionPlanInfos
    .filter((plan) => plan.type !== subscriptionPlanData.type)
    .filter((plan) => {
      if (plan.state === 'change-period-requested' || plan.state === 'change-option-and-period-requested') {
        return plan.changeRequestedPeriod === period;
      }

      return plan.period === period;
    });
  const otherRequestedPeriodNextPurchaseAmounts = otherRequestedPeriodInfos.map(calculateNextPurchaseAmount);
  const failedOtherRequestedPeriodNextPurchaseAmounts = otherRequestedPeriodNextPurchaseAmounts.filter((result) => !result.ok) as CalculateNextPurchaseAmountResultFailure[];
  if (failedOtherRequestedPeriodNextPurchaseAmounts.length > 0) {
    return {
      ok: false,
      resultCode: failedOtherRequestedPeriodNextPurchaseAmounts[0].resultCode,
    };
  }
  const succeededOtherRequestedPeriodNextPurchaseAmounts = otherRequestedPeriodNextPurchaseAmounts.filter((result) => result.ok) as CalculateNextPurchaseAmountResultSuccess[];
  const otherRequestedPeriodNextPurchaseAmount = succeededOtherRequestedPeriodNextPurchaseAmounts.reduce((acc, cur) => acc + cur.amount, 0);
  const nextPurchaseTotalPrice = Math.floor(nextPlanPurchaseAmount + otherRequestedPeriodNextPurchaseAmount);
  return {
    ok: true,
    nextPurchaseTotalPrice,
  };
}

export interface PreprocessPurchaseSubscriptionOptions {
  organization: BillingOrganization;
  subscriptionPlan: BillingSubscriptionPlanPreviewDto;
}

export interface PreprocessPurchaseSubscriptionResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface PreprocessPurchaseSubscriptionResultSuccess {
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
  billingSubscriptionPlan: BillingSubscriptionPlanPreviewDto;
}

export async function preprocessPurchaseSubscription(
  context: RetrySerializeContext,
  options: PreprocessPurchaseSubscriptionOptions,
): Promise<PreprocessPurchaseSubscriptionResult> {
  const { organization } = options;
  const subscriptionPlan = options.subscriptionPlan;
  if (organization.category !== subscriptionPlan.category) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-category-not-matched'),
    };
  }

  const { billingOrganizationId, organizationId } = organization;
  const currency = resolveCurrency(organization, subscriptionPlan.currency);
  const timezoneOffsetString = resolveTimezoneOffset(organization, subscriptionPlan.timezoneOffset);
  const parseTimezoneOffsetResult = parseTimezoneOffset(timezoneOffsetString);
  if (!parseTimezoneOffsetResult.ok) {
    return {
      ok: false,
      resultCode: parseTimezoneOffsetResult.resultCode,
    };
  }
  const { timezoneOffset } = parseTimezoneOffsetResult;

  const subscriptionPlanInfos = organization.billingSubscriptionPlanInfos ?? [];
  if (subscriptionPlanInfos.length > 0 && subscriptionPlanInfos.some((plan) => plan.currency !== currency)) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-currency-not-matched'),
    };
  }

  const parseSubscriptionPlanDataResult = await parseSubscriptionPlanData({
    context, //
    billingOrganizationId,
    type: subscriptionPlan.type,
    category: subscriptionPlan.category,
    option: subscriptionPlan.option,
    currency,
    period: subscriptionPlan.period,
  });
  if (!parseSubscriptionPlanDataResult.ok) {
    return {
      ok: parseSubscriptionPlanDataResult.ok,
      resultCode: parseSubscriptionPlanDataResult.resultCode,
    };
  }

  const { subscriptionPlanData } = parseSubscriptionPlanDataResult;
  const parseCouponResult = await parseCoupon(context, organizationId, subscriptionPlan.couponCode);
  if (!parseCouponResult.ok) {
    return {
      ok: parseCouponResult.ok,
      resultCode: parseCouponResult.resultCode,
    };
  }

  const { coupon } = parseCouponResult;
  const { couponFactor, nextCouponFactor } = calculateCouponFactor({
    coupon,
    period,
  });
  const currentPlanPurchaseAmount = subscriptionPlanData.originPrice * couponFactor;
  const currentPlanDiscountAmount = subscriptionPlanData.originPrice - currentPlanPurchaseAmount;
  const couponPreviewResponse: CouponPreviewResponse | null = coupon
    ? {
        ...coupon,
        discountAmount: currentPlanDiscountAmount,
      }
    : null;

  const nextPlanPurchaseAmount = subscriptionPlanData.originPrice * nextCouponFactor;
  const localNextPurchaseDate = calculateLocalNextPurchaseDate({ organization, period, timezoneOffset });
  const calculateNextPurchaseTotalPriceResult = calculateNextPurchaseTotalPrice({
    subscriptionPlanInfos,
    subscriptionPlanData,
    period,
    nextPlanPurchaseAmount,
  });
  if (!calculateNextPurchaseTotalPriceResult.ok) {
    return {
      ok: false,
      resultCode: calculateNextPurchaseTotalPriceResult.resultCode,
    };
  }
  const { nextPurchaseTotalPrice } = calculateNextPurchaseTotalPriceResult;

  const foundSubscriptionPlanInfo = subscriptionPlanInfos.find((plan) => plan.type === subscriptionPlanData.type);
  if (foundSubscriptionPlanInfo === undefined) {
    const totalPrice = currentPlanPurchaseAmount;
    return {
      ok: true,
      previewResponse: {
        ok: true,
        resultCode: resultCode('ok'),
        totalPrice: Math.floor(totalPrice),
        tax: 0,
        nextPurchaseTotalPrice,
        nextPurchaseDate: localNextPurchaseDate,
        subscriptionPlan: subscriptionPlanData,
        elapsedPlans: [],
        remainingPlans: [],
        coupon: couponPreviewResponse,
      },
      subscriptionPlanData,
      subscriptionPlanSource,
      coupon,
      discountedAmount: currentPlanDiscountAmount,
      totalPrice,
      timezoneOffset,
    };
  } else {
    const upgradePlanOption = foundSubscriptionPlanInfo.option < subscriptionPlanData.option;
    const upgradePlanPeriod = foundSubscriptionPlanInfo.period === 'monthly' && subscriptionPlanData.period === 'yearly';
    if (upgradePlanOption || upgradePlanPeriod) {
      const calculateRemaningPlanResult = calculateRemainingPlan({
        organization,
        foundSubscriptionPlanInfo,
        period,
        timezoneOffset,
      });
      if (!calculateRemaningPlanResult.ok) {
        return {
          ok: false,
          resultCode: calculateRemaningPlanResult.resultCode,
        };
      }

      const { remainingPlan } = calculateRemaningPlanResult;

      const calculateElapsedPlanResult = calculateElapsedPlan({
        organization,
        subscriptionPlanData,
        timezoneOffset,
        discountedAmount: currentPlanDiscountAmount,
      });
      if (!calculateElapsedPlanResult.ok) {
        return {
          ok: false,
          resultCode: calculateElapsedPlanResult.resultCode,
        };
      }

      const { elapsedPlan } = calculateElapsedPlanResult;
      const totalPrice = currentPlanPurchaseAmount - remainingPlan.amount - elapsedPlan.amount;
      return {
        ok: true,
        previewResponse: {
          ok: true,
          resultCode: resultCode('ok'),
          totalPrice: Math.floor(totalPrice),
          tax: 0,
          nextPurchaseTotalPrice,
          nextPurchaseDate: localNextPurchaseDate,
          subscriptionPlan: subscriptionPlanData,
          coupon: couponPreviewResponse,
          elapsedPlans: [elapsedPlan],
          remainingPlans: [remainingPlan],
        },
        subscriptionPlanData,
        subscriptionPlanSource,
        coupon,
        discountedAmount: currentPlanDiscountAmount,
        totalPrice,
        timezoneOffset,
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
  organization: BillingOrganization;
  methodNice: BillingMethodNiceBase;
  subscriptionPlanData: BillingSubscriptionPlanData;
  subscriptionPlanSource: BillingSubscriptionPlanSource | null;
  coupon: BillingCoupon | null;
  totalPrice: number;
  discountedAmount: number;
  timezoneOffset: TimezoneOffset;
  previewResponse: GetBillingSubscriptionPreviewResponse;
}

export async function processPurchaseSubscription(
  context: RetrySerializeContext,
  billingMethodNiceCaller: BillingMethodNiceCaller,
  options: ProcessPurchaseSubscriptionOptions,
): Promise<CreatePurchaseSubscriptionResponse> {
  const { manager } = context;
  const { organization, methodNice, totalPrice, coupon, discountedAmount, subscriptionPlanData, subscriptionPlanSource, timezoneOffset, previewResponse } = options;
  const createPurchaseResult = await createPurchase(context, billingMethodNiceCaller, {
    billingMethodNiceId: methodNice.billingMethodNiceId,
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

  // update organization
  if (organization.currency === null) {
    organization.currency = subscriptionPlanData.currency;
  }
  switch (subscriptionPlanData.period) {
    case 'monthly': {
      if (organization.monthlyCalculationExpiredAt === null) {
        organization.monthlyCalculationStartedAt = createCalculationStartedAtFromNow(timezoneOffset);
      } else {
        organization.monthlyCalculationStartedAt = organization.monthlyCalculationExpiredAt;
      }
      organization.monthlyCalculationExpiredAt = createCalculationExpiredAt(organization.monthlyCalculationStartedAt, subscriptionPlanData.period);
      break;
    }
    case 'yearly': {
      if (organization.yearlyCalculationExpiredAt === null) {
        organization.yearlyCalculationStartedAt = createCalculationStartedAtFromNow(timezoneOffset);
      } else {
        organization.yearlyCalculationStartedAt = organization.yearlyCalculationExpiredAt;
      }
      organization.yearlyCalculationExpiredAt = createCalculationExpiredAt(organization.yearlyCalculationStartedAt, subscriptionPlanData.period);
      break;
    }
    default: {
      assertUnreachable(subscriptionPlanData.period);
    }
  }
  await manager.getRepository(BillingOrganization).save(organization);

  // update coupon
  let billingCouponId: string | null = null;
  let billingCouponRemainingApplyCount: number | null = null;
  if (coupon) {
    if (coupon.remainingAvailableCount && coupon.remainingAvailableCount > 0) {
      coupon.remainingAvailableCount -= 1;
    }
    await manager.getRepository(BillingCoupon).save(coupon);

    billingCouponId = coupon.billingCouponId;
    switch (subscriptionPlanData.period) {
      case 'monthly': {
        billingCouponRemainingApplyCount = coupon.monthlyApplyCount;
        break;
      }
      case 'yearly': {
        billingCouponRemainingApplyCount = coupon.yearlyApplyCount;
        break;
      }
      default: {
        assertUnreachable(subscriptionPlanData.period);
      }
    }

    await registerUsedCoupon(context, {
      billingOrganizationId: organization.billingOrganizationId,
      billingCouponId: coupon.billingCouponId,
    });
  }

  const createSubscriptionPlanInfoResult = await createSubscriptionPlanInfo(context, {
    billingOrganizationId: organization.billingOrganizationId,
    subscriptionPlanData,
    discountedAmount,
    billingCouponId,
    billingCouponRemainingApplyCount,
    billingSubscriptionPlanSourceId: subscriptionPlanSource?.billingSubscriptionPlanSourceId ?? null,
  });
  if (!createSubscriptionPlanInfoResult.ok) {
    return {
      ok: false,
      resultCode: createSubscriptionPlanInfoResult.resultCode,
    };
  }

  {
    const created = manager.getRepository(BillingHistory).create({
      billingHistoryId: v4(),
      billingOrganizationId: organization.billingOrganizationId,
      purchasedAt: new Date(),
      niceSubscribePaymentsResponse: createPurchaseResult.response as unknown as Record<string, unknown>,
      previewResponse: previewResponse as unknown as Record<string, unknown>,
    });
    await manager.getRepository(BillingHistory).save(created);
  }

  return {
    ok: true,
    resultCode: resultCode('ok'),
  };
}
