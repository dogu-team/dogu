import {
  BillingGoodsName,
  BillingMethodNiceBase,
  BillingPlanHistoryData,
  BillingPlanInfoResponse,
  BillingPlanPreviewOptions,
  BillingResult,
  CreatePurchaseResponse,
  GetBillingPreviewResponse,
  resultCode,
} from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { v4 } from 'uuid';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPlanHistory } from '../../db/entity/billing-plan-history.entity';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { BillingPlanSource } from '../../db/entity/billing-plan-source.entity';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { RetryTransactionContext } from '../../db/retry-transaction';
import { findAvailablePromotionCoupon, parseCoupon, useCoupon } from '../billing-coupon/billing-coupon.serializables';
import { ResolveCouponResultSuccess } from '../billing-coupon/billing-coupon.utils';
import { createPurchase } from '../billing-method/billing-method-nice.serializables';
import { newAndApplyPlanInfo } from '../billing-plan-info/billing-plan-info.serializables';
import { updateCloudLicense } from '../cloud-license/cloud-license.serializables';
import { BillingPlanInfoResponseBuilder } from '../common/plan-info-common.module';
import { NiceCaller } from '../nice/nice.caller';
import { CalculatePurchaseDateTimesResultSuccess, getPurchaseDateTimes, processPurchasePreviewInternal, resolveCurrency } from './billing-purchase.utils';

export interface ProcessPurchasePreviewOptions {
  billingOrganization: BillingOrganization;
  previewOptions: BillingPlanPreviewOptions;
  now: Date;
}

export interface ProcessPurchasePreviewResultValue {
  previewResponse: GetBillingPreviewResponse;
  couponResult: ResolveCouponResultSuccess;
  planSource: BillingPlanSource;
  needPurchase: boolean;
  totalPrice: number;
  discountedAmount: number;
  now: Date;
  dateTimes: CalculatePurchaseDateTimesResultSuccess;
  planHistory: BillingPlanHistoryData | null;
}

export async function processPurchasePreview(context: RetryTransactionContext, options: ProcessPurchasePreviewOptions): Promise<BillingResult<ProcessPurchasePreviewResultValue>> {
  const { billingOrganization, previewOptions, now } = options;
  const { billingPlanSourceId } = previewOptions;
  const { billingOrganizationId, organizationId } = billingOrganization;
  const planSource = await context.manager.getRepository(BillingPlanSource).findOne({
    where: {
      billingPlanSourceId,
    },
  });

  if (!planSource) {
    return {
      ok: false,
      resultCode: resultCode('plan-source-not-found', {
        billingOrganizationId,
        billingPlanSourceId: previewOptions.billingPlanSourceId,
      }),
    };
  }

  const resolvedCurrency = resolveCurrency(billingOrganization.currency, planSource.currency);

  const parseCouponResult = await parseCoupon({
    context,
    organizationId,
    couponCode: previewOptions.couponCode,
    period: planSource.period,
    planType: planSource.type,
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
    const subscribed = billingOrganization.billingPlanInfos?.find((plan) => plan.type === planSource.type && plan.state !== 'unsubscribed');
    if (!subscribed) {
      const promotionCoupon = await findAvailablePromotionCoupon(context, {
        billingOrganizationId,
        planType: planSource.type,
        now,
      });
      if (promotionCoupon) {
        const promotionResult = await parseCoupon({
          context,
          organizationId,
          couponCode: promotionCoupon.code,
          period: planSource.period,
          planType: planSource.type,
          now,
        });
        if (promotionResult.ok) {
          coupon = promotionResult.value;
        }
      }
    }
  }

  return processPurchasePreviewInternal({
    billingOrganization,
    previewOptions,
    resolvedCurrency,
    planSource,
    coupon,
    now,
  });
}

export interface ProcessNowPurchaseOptions {
  niceCaller: NiceCaller;
  billingOrganization: BillingOrganization;
  billingMethodNice: BillingMethodNiceBase;
  planSource: BillingPlanSource;
  couponResult: ResolveCouponResultSuccess;
  totalPrice: number;
  discountedAmount: number;
  previewResponse: GetBillingPreviewResponse;
  dateTimes: CalculatePurchaseDateTimesResultSuccess;
  planHistory: BillingPlanHistoryData | null;
}

export interface ProcessNowPurchaseResponse extends CreatePurchaseResponse {
  planHistory: BillingHistory | null;
}

export async function processNowPurchase(context: RetryTransactionContext, options: ProcessNowPurchaseOptions): Promise<ProcessNowPurchaseResponse> {
  const { manager } = context;
  const { niceCaller, billingOrganization, billingMethodNice, totalPrice, couponResult, discountedAmount, planSource, previewResponse } = options;
  const { period, currency } = planSource;
  const { billingOrganizationId, billingPlanInfos } = billingOrganization;
  if (billingPlanInfos === undefined) {
    return {
      ok: false,
      resultCode: resultCode('organization-plan-infos-not-found', {
        billingOrganizationId,
      }),
      plan: null,
      license: null,
      niceResultCode: null,
      planHistory: null,
    };
  }

  const createPurchaseResult = await createPurchase(context, niceCaller, {
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
  const planInfoResult = newAndApplyPlanInfo(context, {
    billingOrganizationId,
    planInfos: billingPlanInfos,
    planSource,
    discountedAmount,
    useCouponResult,
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

  const dateTimes = getPurchaseDateTimes(options.dateTimes, period);

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

  const hasMonthlyPlan = billingPlanInfos.some((plan) => plan.period === 'monthly' && plan.state !== 'unsubscribed');
  if (!hasMonthlyPlan) {
    billingOrganization.subscriptionMonthlyStartedAt = null;
    billingOrganization.subscriptionMonthlyExpiredAt = null;
  }

  const hasYearlyPlan = billingPlanInfos.some((plan) => plan.period === 'yearly' && plan.state !== 'unsubscribed');
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
    const billingPlanHistory = manager.getRepository(BillingPlanHistory).create({
      billingPlanHistoryId: v4(),
      billingHistoryId: billingHistory.billingHistoryId,
      billingOrganizationId,
      historyType: 'immediate-purchase',
      ...planHistory,
    });
    await manager.getRepository(BillingPlanHistory).save(billingPlanHistory);

    const info = billingOrganization.billingPlanInfos?.find((plan) => plan.type === planSource.type);
    if (info) {
      info.billingPlanHistoryId = billingPlanHistory.billingPlanHistoryId;
      await manager.getRepository(BillingPlanInfo).save(info);
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

  const planInfoResponse = new BillingPlanInfoResponseBuilder(billingOrganization, []).build(planInfoResult.value);
  return {
    ok: true,
    resultCode: resultCode('ok'),
    plan: planInfoResponse,
    license,
    niceResultCode: null,
    planHistory: savedBillingHistory,
  };
}

export interface ProcessNextPurchaseOptions {
  billingOrganization: BillingOrganization;
  planSource: BillingPlanSource;
  totalPrice: number;
  discountedAmount: number;
  previewResponse: GetBillingPreviewResponse;
  dateTimes: CalculatePurchaseDateTimesResultSuccess;
}

export async function processNextPurchase(context: RetryTransactionContext, options: ProcessNextPurchaseOptions): Promise<BillingResult<BillingPlanInfoResponse>> {
  const { manager } = context;
  const { billingOrganization, planSource, discountedAmount } = options;
  const found = billingOrganization.billingPlanInfos?.find((plan) => plan.type === planSource.type);
  if (!found) {
    return {
      ok: false,
      resultCode: resultCode('plan-not-found', {
        billingOrganizationId: billingOrganization.billingOrganizationId,
        type: planSource.type,
      }),
    };
  }

  if (found.state === 'unsubscribed') {
    return {
      ok: false,
      resultCode: resultCode('plan-unsubscribed', {
        billingOrganizationId: billingOrganization.billingOrganizationId,
        type: planSource.type,
      }),
    };
  }

  found.changeRequestedPeriod = planSource.period;
  found.changeRequestedOption = planSource.option;
  found.changeRequestedOriginPrice = planSource.originPrice;
  found.changeRequestedDiscountedAmount = discountedAmount;
  found.state = 'change-option-or-period-requested';
  const planInfo = await manager.getRepository(BillingPlanInfo).save(found);
  const planInfoResponse = new BillingPlanInfoResponseBuilder(billingOrganization, []).build(planInfo);
  return {
    ok: true,
    value: planInfoResponse,
  };
}
