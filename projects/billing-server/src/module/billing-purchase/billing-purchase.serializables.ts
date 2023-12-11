import {
  BillingCurrency,
  BillingGoodsName,
  BillingPlanHistoryData,
  BillingPlanInfoResponse,
  BillingPreprocessOptions,
  BillingResult,
  CreatePurchaseResponse,
  GetBillingPreviewResponse,
  resultCode,
} from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { v4 } from 'uuid';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPlanHistory } from '../../db/entity/billing-plan-history.entity';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { BillingPlanSource } from '../../db/entity/billing-plan-source.entity';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { RetryTransactionContext } from '../../db/retry-transaction';
import { parseCoupon, useCoupon } from '../billing-coupon/billing-coupon.serializables';
import { ResolveCouponResultSuccess } from '../billing-coupon/billing-coupon.utils';
import { createPurchase } from '../billing-method/billing-method-nice.serializables';
import { findBillingOrganization } from '../billing-organization/billing-organization.serializables';
import { updateCurrency, updateMethod, validateMethod } from '../billing-organization/billing-organization.utils';
import { newAndApplyPlanInfo } from '../billing-plan-info/billing-plan-info.serializables';
import { findBillingPlanSource } from '../billing-plan-source/billing-plan-source.serializables';
import { updateCloudLicense } from '../cloud-license/cloud-license.serializables';
import { BillingPlanInfoResponseBuilder } from '../common/plan-info-common.module';
import { NiceCaller } from '../nice/nice.caller';
import { CalculatePurchaseDateTimesResultSuccess, getPurchaseDateTimes, resolveCurrency } from './billing-purchase.utils';

export type PreprocessOptions = BillingPreprocessOptions & {
  now: Date;
};

export type PreprocessResult = {
  organization: BillingOrganization;
  planSource: BillingPlanSource;
  coupon: BillingCoupon | null;
  currency: BillingCurrency;
  now: Date;
};

export async function preprocess(context: RetryTransactionContext, options: PreprocessOptions): Promise<BillingResult<PreprocessResult>> {
  const { organizationId, billingPlanSourceId, couponCode, now } = options;
  const organization = await findBillingOrganization(context, {
    organizationId,
  });
  if (!organization) {
    return {
      ok: false,
      resultCode: resultCode('organization-not-found', {
        organizationId,
      }),
    };
  }

  const planSource = await findBillingPlanSource(context, {
    billingPlanSourceId,
  });
  if (!planSource) {
    return {
      ok: false,
      resultCode: resultCode('plan-source-not-found', {
        organizationId,
        billingPlanSourceId,
      }),
    };
  }

  const currency = resolveCurrency(organization.currency, planSource.currency);
  const parseCouponResult = await parseCoupon(context, {
    couponCode,
    organization,
    planSource,
    now,
  });
  if (!parseCouponResult.ok) {
    return parseCouponResult;
  }

  return {
    ok: true,
    value: {
      organization,
      planSource,
      coupon: parseCouponResult.value,
      currency,
      now,
    },
  };
}

export type ProcessPurchasePreviewOptions = PreprocessResult;

export interface ProcessNowPurchaseOptions {
  niceCaller: NiceCaller;
  organization: BillingOrganization;
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
  const { niceCaller, organization, totalPrice, couponResult, discountedAmount, planSource, previewResponse } = options;
  const { period, currency } = planSource;
  const { organizationId, billingOrganizationId, billingPlanInfos, billingMethodNice } = organization;
  if (billingPlanInfos === undefined) {
    return {
      ok: false,
      resultCode: resultCode('organization-plan-infos-not-found', {
        organizationId,
      }),
      plan: null,
      license: null,
      niceResultCode: null,
      planHistory: null,
    };
  }

  if (!billingMethodNice) {
    return {
      ok: false,
      resultCode: resultCode('organization-method-nice-not-found', {
        organizationId,
      }),
      plan: null,
      license: null,
      niceResultCode: null,
      planHistory: null,
    };
  }

  validateMethod(organization, 'nice');
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
  updateMethod(organization, 'nice');

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

  updateCurrency(organization, currency);
  switch (period) {
    case 'monthly': {
      organization.subscriptionMonthlyStartedAt = dateTimes.startedAt.date;
      organization.subscriptionMonthlyExpiredAt = dateTimes.expiredAt.date;
      break;
    }
    case 'yearly': {
      organization.subscriptionYearlyStartedAt = dateTimes.startedAt.date;
      organization.subscriptionYearlyExpiredAt = dateTimes.expiredAt.date;
      break;
    }
    default: {
      assertUnreachable(period);
    }
  }

  const hasMonthlyPlan = billingPlanInfos.some((plan) => plan.period === 'monthly' && plan.state !== 'unsubscribed');
  if (!hasMonthlyPlan) {
    organization.subscriptionMonthlyStartedAt = null;
    organization.subscriptionMonthlyExpiredAt = null;
  }

  const hasYearlyPlan = billingPlanInfos.some((plan) => plan.period === 'yearly' && plan.state !== 'unsubscribed');
  if (!hasYearlyPlan) {
    organization.subscriptionYearlyStartedAt = null;
    organization.subscriptionYearlyExpiredAt = null;
  }
  await manager.save(organization);

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

    const info = organization.billingPlanInfos?.find((plan) => plan.type === planSource.type);
    if (info) {
      info.billingPlanHistoryId = billingPlanHistory.billingPlanHistoryId;
      await manager.getRepository(BillingPlanInfo).save(info);
    }
  }

  let license: CloudLicense | SelfHostedLicense | null = null;
  switch (organization.category) {
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
      assertUnreachable(organization.category);
    }
  }

  const planInfoResponse = new BillingPlanInfoResponseBuilder(organization, []).build(planInfoResult.value);
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
  organization: BillingOrganization;
  planSource: BillingPlanSource;
  totalPrice: number;
  discountedAmount: number;
  previewResponse: GetBillingPreviewResponse;
  dateTimes: CalculatePurchaseDateTimesResultSuccess;
}

export async function processNextPurchase(context: RetryTransactionContext, options: ProcessNextPurchaseOptions): Promise<BillingResult<BillingPlanInfoResponse>> {
  const { manager } = context;
  const { organization, planSource, discountedAmount } = options;
  const found = organization.billingPlanInfos?.find((plan) => plan.type === planSource.type);
  if (!found) {
    return {
      ok: false,
      resultCode: resultCode('plan-not-found', {
        organizationId: organization.organizationId,
        type: planSource.type,
      }),
    };
  }

  if (found.state === 'unsubscribed') {
    return {
      ok: false,
      resultCode: resultCode('plan-unsubscribed', {
        billingOrganizationId: organization.billingOrganizationId,
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
  const planInfoResponse = new BillingPlanInfoResponseBuilder(organization, []).build(planInfo);
  return {
    ok: true,
    value: planInfoResponse,
  };
}
