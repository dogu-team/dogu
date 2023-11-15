import {
  BillingGoodsName,
  BillingMethodNiceBase,
  BillingResult,
  BillingSubscriptionPlanData,
  BillingSubscriptionPlanHistoryData,
  BillingSubscriptionPlanInfoResponse,
  BillingSubscriptionPlanPreviewDto,
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
import { RetryTransactionContext } from '../../db/retry-transaction';
import { findAvailablePromotionCoupon, parseCoupon, useCoupon } from '../billing-coupon/billing-coupon.serializables';
import { ResolveCouponResultSuccess } from '../billing-coupon/billing-coupon.utils';
import { BillingMethodNiceCaller } from '../billing-method/billing-method-nice.caller';
import { createPurchase } from '../billing-method/billing-method-nice.serializables';
import { newAndApplySubscriptionPlanInfo } from '../billing-subscription-plan-info/billing-subscription-plan-info.serializables';
import { parseSubscriptionPlanData } from '../billing-subscription-plan-source/billing-subscription-plan-source.serializables';
import { updateCloudLicense } from '../cloud-license/cloud-license.serializables';
import { BillingSubscriptionPlanInfoCommonModule } from '../common/plan-info-common.module';
import {
  CalculatePurchaseSubscriptionDateTimesResultSuccess,
  getPurchaseSubscriptionDateTimes,
  processPurchaseSubscriptionPreviewInternal,
  resolveCurrency,
} from './billing-purchase.utils';

export interface ProcessPurchaseSubscriptionPreviewOptions {
  billingOrganization: BillingOrganization;
  dto: BillingSubscriptionPlanPreviewDto;
  now: Date;
}

export interface ProcessPurchaseSubscriptionPreviewResultValue {
  previewResponse: GetBillingSubscriptionPreviewResponse;
  couponResult: ResolveCouponResultSuccess;
  planData: BillingSubscriptionPlanData;
  planSource: BillingSubscriptionPlanSource | null;
  needPurchase: boolean;
  totalPrice: number;
  discountedAmount: number;
  now: Date;
  dateTimes: CalculatePurchaseSubscriptionDateTimesResultSuccess;
  planHistory: BillingSubscriptionPlanHistoryData | null;
}

export async function processPurchaseSubscriptionPreview(
  context: RetryTransactionContext,
  options: ProcessPurchaseSubscriptionPreviewOptions,
): Promise<BillingResult<ProcessPurchaseSubscriptionPreviewResultValue>> {
  const { billingOrganization, dto, now } = options;
  const { billingOrganizationId, organizationId } = billingOrganization;
  const resolvedCurrency = resolveCurrency(billingOrganization.currency, dto.currency);

  const parseSubscriptionPlanDataResult = await parseSubscriptionPlanData(context, {
    billingOrganizationId,
    type: dto.type,
    category: dto.category,
    option: dto.option,
    currency: resolvedCurrency,
    period: dto.period,
  });
  if (!parseSubscriptionPlanDataResult.ok) {
    return {
      ok: parseSubscriptionPlanDataResult.ok,
      resultCode: parseSubscriptionPlanDataResult.resultCode,
    };
  }

  const parseCouponResult = await parseCoupon({
    context,
    organizationId,
    couponCode: dto.couponCode,
    period: dto.period,
    subscriptionPlanType: parseSubscriptionPlanDataResult.value.planData.type,
    now,
  });
  if (!parseCouponResult.ok) {
    return {
      ok: parseCouponResult.ok,
      resultCode: parseCouponResult.resultCode,
    };
  }

  // promotion coupon
  let coupon = parseCouponResult.value;
  if (!coupon) {
    const subscribed = billingOrganization.billingSubscriptionPlanInfos?.find(
      (plan) => plan.type === parseSubscriptionPlanDataResult.value.planData.type && plan.state !== 'unsubscribed',
    );
    if (!subscribed) {
      const promotionCoupon = await findAvailablePromotionCoupon(context, {
        billingOrganizationId,
        subscriptionPlanType: parseSubscriptionPlanDataResult.value.planData.type,
        now,
      });
      if (promotionCoupon) {
        const promotionResult = await parseCoupon({
          context,
          organizationId,
          couponCode: promotionCoupon.code,
          period: dto.period,
          subscriptionPlanType: parseSubscriptionPlanDataResult.value.planData.type,
          now,
        });
        if (promotionResult.ok) {
          coupon = promotionResult.value;
        }
      }
    }
  }

  return processPurchaseSubscriptionPreviewInternal({
    billingOrganization,
    dto,
    resolvedCurrency,
    parseSubscriptionPlanDataResultValue: parseSubscriptionPlanDataResult.value,
    coupon,
    now,
  });
}

export interface ProcessNowPurchaseSubscriptionOptions {
  billingOrganization: BillingOrganization;
  billingMethodNice: BillingMethodNiceBase;
  planData: BillingSubscriptionPlanData;
  planSource: BillingSubscriptionPlanSource | null;
  couponResult: ResolveCouponResultSuccess;
  totalPrice: number;
  discountedAmount: number;
  previewResponse: GetBillingSubscriptionPreviewResponse;
  dateTimes: CalculatePurchaseSubscriptionDateTimesResultSuccess;
  planHistory: BillingSubscriptionPlanHistoryData | null;
}

export interface ProcessNowPurchaseSubscriptionResponse extends CreatePurchaseSubscriptionResponse {
  planHistory: BillingHistory | null;
}

export async function processNowPurchaseSubscription(
  context: RetryTransactionContext,
  billingMethodNiceCaller: BillingMethodNiceCaller,
  options: ProcessNowPurchaseSubscriptionOptions,
): Promise<ProcessNowPurchaseSubscriptionResponse> {
  const { manager } = context;
  const { billingOrganization, billingMethodNice, totalPrice, couponResult, discountedAmount, planData, planSource, previewResponse } = options;
  const { period, currency } = planData;
  const { billingOrganizationId, billingSubscriptionPlanInfos } = billingOrganization;
  if (billingSubscriptionPlanInfos === undefined) {
    return {
      ok: false,
      resultCode: resultCode('organization-subscription-plan-infos-not-found', {
        billingOrganizationId,
      }),
      plan: null,
      license: null,
      niceResultCode: null,
      planHistory: null,
    };
  }

  const createPurchaseResult = await createPurchase(context, billingMethodNiceCaller, {
    billingMethodNiceId: billingMethodNice.billingMethodNiceId,
    goodsName: BillingGoodsName,
    amount: totalPrice,
  });
  if (!createPurchaseResult.ok) {
    return {
      ok: false,
      resultCode: createPurchaseResult.resultCode,
      plan: null,
      license: null,
      niceResultCode: createPurchaseResult.niceResultCode,
      planHistory: null,
    };
  }
  const { tid, orderId } = createPurchaseResult.value;

  const useCouponResult = await useCoupon(context, { couponResult, billingOrganizationId });
  const planInfoResult = newAndApplySubscriptionPlanInfo(context, {
    billingOrganizationId,
    subscriptionPlanInfos: billingSubscriptionPlanInfos,
    planData,
    discountedAmount,
    useCouponResult,
    billingSubscriptionPlanSourceId: planSource?.billingSubscriptionPlanSourceId ?? null,
  });

  if (!planInfoResult.ok) {
    return {
      ok: false,
      resultCode: planInfoResult.resultCode,
      plan: null,
      license: null,
      niceResultCode: null,
      planHistory: null,
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

  const hasMonthlyPlan = billingSubscriptionPlanInfos.some((plan) => plan.period === 'monthly' && plan.state !== 'unsubscribed');
  if (!hasMonthlyPlan) {
    billingOrganization.subscriptionMonthlyStartedAt = null;
    billingOrganization.subscriptionMonthlyExpiredAt = null;
  }

  const hasYearlyPlan = billingSubscriptionPlanInfos.some((plan) => plan.period === 'yearly' && plan.state !== 'unsubscribed');
  if (!hasYearlyPlan) {
    billingOrganization.subscriptionYearlyStartedAt = null;
    billingOrganization.subscriptionYearlyExpiredAt = null;
  }
  await manager.getRepository(BillingOrganization).save(billingOrganization);

  const billingHistory = manager.getRepository(BillingHistory).create({
    billingHistoryId: v4(),
    billingOrganizationId,
    niceSubscribePaymentsResponse: createPurchaseResult.value as unknown as Record<string, unknown>,
    previewResponse: previewResponse as unknown as Record<string, unknown>,
    method: 'nice',
    goodsName: BillingGoodsName,
    purchasedAmount: totalPrice,
    currency,
    historyType: 'immediate-purchase',
    niceTid: tid,
    niceOrderId: orderId,
    cardCode: billingMethodNice.cardCode,
    cardName: billingMethodNice.cardName,
    cardNumberLast4Digits: billingMethodNice.cardNumberLast4Digits,
    cardExpirationYear: billingMethodNice.expirationYear,
    cardExpirationMonth: billingMethodNice.expirationMonth,
  });
  const savedBillingHistory = await manager.getRepository(BillingHistory).save(billingHistory);

  const planHistory = options.planHistory;
  if (planHistory) {
    const billingSubscriptionPlanHistory = manager.getRepository(BillingSubscriptionPlanHistory).create({
      billingSubscriptionPlanHistoryId: v4(),
      billingHistoryId: billingHistory.billingHistoryId,
      billingOrganizationId,
      historyType: 'immediate-purchase',
      ...planHistory,
    });
    await manager.getRepository(BillingSubscriptionPlanHistory).save(billingSubscriptionPlanHistory);

    const info = billingOrganization.billingSubscriptionPlanInfos?.find((plan) => plan.type === planData.type);
    if (info) {
      info.billingSubscriptionPlanHistoryId = billingSubscriptionPlanHistory.billingSubscriptionPlanHistoryId;
      await manager.getRepository(BillingSubscriptionPlanInfo).save(info);
    }
  }

  let license: CloudLicense | SelfHostedLicense | null = null;
  switch (billingOrganization.category) {
    case 'cloud':
      {
        const licenseResult = await updateCloudLicense(context, {
          billingOrganizationId,
          planInfos: [planInfoResult.value],
        });
        if (licenseResult.ok) {
          license = licenseResult.value;
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

  const planInfoResponse = BillingSubscriptionPlanInfoCommonModule.createPlanInfoResponse(billingOrganization, planInfoResult.value);
  return {
    ok: true,
    resultCode: resultCode('ok'),
    plan: planInfoResponse,
    license,
    niceResultCode: null,
    planHistory: savedBillingHistory,
  };
}

export interface ProcessNextPurchaseSubscriptionOptions {
  billingOrganization: BillingOrganization;
  planData: BillingSubscriptionPlanData;
  totalPrice: number;
  discountedAmount: number;
  previewResponse: GetBillingSubscriptionPreviewResponse;
  dateTimes: CalculatePurchaseSubscriptionDateTimesResultSuccess;
}

export async function processNextPurchaseSubscription(
  context: RetryTransactionContext,
  options: ProcessNextPurchaseSubscriptionOptions,
): Promise<BillingResult<BillingSubscriptionPlanInfoResponse>> {
  const { manager } = context;
  const { billingOrganization, planData, discountedAmount } = options;
  const found = billingOrganization.billingSubscriptionPlanInfos?.find((plan) => plan.type === planData.type);
  if (!found) {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-not-found', {
        billingOrganizationId: billingOrganization.billingOrganizationId,
        type: planData.type,
      }),
    };
  }

  if (found.state === 'unsubscribed') {
    return {
      ok: false,
      resultCode: resultCode('subscription-plan-unsubscribed', {
        billingOrganizationId: billingOrganization.billingOrganizationId,
        type: planData.type,
      }),
    };
  }

  found.changeRequestedPeriod = planData.period;
  found.changeRequestedOption = planData.option;
  found.changeRequestedOriginPrice = planData.originPrice;
  found.changeRequestedDiscountedAmount = discountedAmount;
  found.state = 'change-option-or-period-requested';
  const planInfo = await manager.getRepository(BillingSubscriptionPlanInfo).save(found);
  const planInfoResponse = BillingSubscriptionPlanInfoCommonModule.createPlanInfoResponse(billingOrganization, planInfo);
  return {
    ok: true,
    value: planInfoResponse,
  };
}
