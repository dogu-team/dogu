import {
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
import { RetrySerializeContext } from '../../db/utils';
import { parseCoupon, useCoupon } from '../billing-coupon/billing-coupon.serializables';
import { ResolveCouponResultSuccess } from '../billing-coupon/billing-coupon.utils';
import { BillingMethodNiceCaller } from '../billing-method/billing-method-nice.caller';
import { createPurchase } from '../billing-method/billing-method-nice.serializables';
import { createOrUpdateBillingSubscriptionPlanInfo } from '../billing-subscription-plan-info/billing-subscription-plan-info.serializables';
import { parseBillingSubscriptionPlanData } from '../billing-subscription-plan-source/billing-subscription-plan-source.serializables';
import { applyCloudLicense } from '../cloud-license/cloud-license.serializables';
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
}

export interface ProcessPurchaseSubscriptionPreviewResultValue {
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

export async function processPurchaseSubscriptionPreview(
  context: RetrySerializeContext,
  options: ProcessPurchaseSubscriptionPreviewOptions,
): Promise<BillingResult<ProcessPurchaseSubscriptionPreviewResultValue>> {
  const { billingOrganization, dto } = options;
  const { billingOrganizationId, organizationId } = billingOrganization;
  const resolvedCurrency = resolveCurrency(billingOrganization.currency, dto.currency);

  const parseSubscriptionPlanDataResult = await parseBillingSubscriptionPlanData(context, {
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
  });
  if (!parseCouponResult.ok) {
    return {
      ok: parseCouponResult.ok,
      resultCode: parseCouponResult.resultCode,
    };
  }

  return processPurchaseSubscriptionPreviewInternal({
    billingOrganization,
    dto,
    resolvedCurrency,
    parseSubscriptionPlanDataResult,
    parseCouponResult,
  });
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
  const { tid, orderId } = createPurchaseResult.value;

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

  const useCouponResult = await useCoupon(context, { couponResult, billingOrganizationId });
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
    niceSubscribePaymentsResponse: createPurchaseResult.value as unknown as Record<string, unknown>,
    previewResponse: previewResponse as unknown as Record<string, unknown>,
    method: 'nice',
    goodsName,
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
  await manager.getRepository(BillingHistory).save(billingHistory);

  const planHistory = options.planHistory;
  if (planHistory) {
    const billingSubscriptionPlanHistory = manager.getRepository(BillingSubscriptionPlanHistory).create({
      billingSubscriptionPlanHistoryId: v4(),
      billingHistoryId: billingHistory.billingHistoryId,
      billingOrganizationId: billingOrganization.billingOrganizationId,
      historyType: 'immediate-purchase',
      ...planHistory,
    });
    await manager.getRepository(BillingSubscriptionPlanHistory).save(billingSubscriptionPlanHistory);

    // link plan info to plan history
    const info = billingOrganization.billingSubscriptionPlanInfos?.find((plan) => plan.type === data.type);
    if (info) {
      info.billingSubscriptionPlanHistoryId = billingSubscriptionPlanHistory.billingSubscriptionPlanHistoryId;
      await manager.getRepository(BillingSubscriptionPlanInfo).save(info);
    }
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

export async function processNextPurchaseSubscription(
  context: RetrySerializeContext,
  options: ProcessNextPurchaseSubscriptionOptions,
): Promise<BillingResult<BillingSubscriptionPlanInfoResponse>> {
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
  const info = await manager.getRepository(BillingSubscriptionPlanInfo).save(found);

  return {
    ok: true,
    value: BillingSubscriptionPlanInfoCommonModule.createPlanInfoResponse(billingOrganization, info),
  };
}
