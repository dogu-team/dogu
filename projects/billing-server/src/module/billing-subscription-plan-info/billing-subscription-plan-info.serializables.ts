import { BillingPeriod, BillingResultCode, BillingSubscriptionPlanData, resultCode } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { v4 } from 'uuid';
import { BillingCoupon } from '../../db/entity/billing-coupon.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { RetrySerializeContext } from '../../db/utils';
import { registerUsedCoupon } from '../billing-organization/billing-organization.serializables';

export interface ProcessNewCouponOptions {
  newCoupon: BillingCoupon;
  billingOrganizationId: string;
  period: BillingPeriod;
}

export interface ProcessNewCouponResult {
  billingCouponId: string;
  billingCouponRemainingApplyCount: number | null;
}

export async function processNewCoupon(context: RetrySerializeContext, options: ProcessNewCouponOptions): Promise<ProcessNewCouponResult> {
  const { manager } = context;
  const { newCoupon, billingOrganizationId, period } = options;
  if (newCoupon.remainingAvailableCount && newCoupon.remainingAvailableCount > 0) {
    newCoupon.remainingAvailableCount -= 1;
  }
  await manager.getRepository(BillingCoupon).save(newCoupon);

  await registerUsedCoupon(context, {
    billingOrganizationId,
    billingCouponId: newCoupon.billingCouponId,
  });

  switch (period) {
    case 'monthly': {
      return {
        billingCouponId: newCoupon.billingCouponId,
        billingCouponRemainingApplyCount: newCoupon.monthlyApplyCount,
      };
    }
    case 'yearly': {
      return {
        billingCouponId: newCoupon.billingCouponId,
        billingCouponRemainingApplyCount: newCoupon.yearlyApplyCount,
      };
    }
    default: {
      assertUnreachable(period);
    }
  }
}

export interface CreateOrUpdateBillingSubscriptionPlanInfoAndCouponOptions {
  billingOrganizationId: string;
  billingSubscriptionPlanData: BillingSubscriptionPlanData;
  discountedAmount: number;
  newCoupon: BillingCoupon | null;
  oldCoupon: BillingCoupon | null;
  billingSubscriptionPlanSourceId: string | null;
}

export interface CreateOrUpdateBillingSubscriptionPlanInfoAndCouponResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CreateOrUpdateBillingSubscriptionPlanInfoAndCouponResultSuccess {
  ok: true;
  subscriptionPlanInfo: BillingSubscriptionPlanInfo;
}

export type CreateOrUpdateBillingSubscriptionPlanInfoAndCouponResult =
  | CreateOrUpdateBillingSubscriptionPlanInfoAndCouponResultFailure
  | CreateOrUpdateBillingSubscriptionPlanInfoAndCouponResultSuccess;

export async function createOrUpdateBillingSubscriptionPlanInfoAndCoupon(
  context: RetrySerializeContext,
  options: CreateOrUpdateBillingSubscriptionPlanInfoAndCouponOptions,
): Promise<CreateOrUpdateBillingSubscriptionPlanInfoAndCouponResult> {
  const { logger, manager } = context;
  const { billingOrganizationId, billingSubscriptionPlanData, discountedAmount, newCoupon, oldCoupon, billingSubscriptionPlanSourceId } = options;
  const found = await manager.getRepository(BillingSubscriptionPlanInfo).findOne({
    where: {
      billingOrganizationId,
      type: billingSubscriptionPlanData.type,
    },
  });

  if (found) {
    let billingCouponId: string | null = null;
    let billingCouponRemainingApplyCount: number | null = null;
    if (newCoupon) {
      const processNewCouponResult = await processNewCoupon(context, { newCoupon, billingOrganizationId, period: billingSubscriptionPlanData.period });
      billingCouponId = processNewCouponResult.billingCouponId;
      billingCouponRemainingApplyCount = processNewCouponResult.billingCouponRemainingApplyCount;
    } else if (oldCoupon) {
      billingCouponId = oldCoupon.billingCouponId;
      billingCouponRemainingApplyCount = found.billingCouponRemainingApplyCount;
    } else {
      return {
        ok: false,
        resultCode: resultCode('coupon-multiple-proceeds-not-allowed'),
      };
    }

    found.category = billingSubscriptionPlanData.category;
    found.option = billingSubscriptionPlanData.option;
    found.currency = billingSubscriptionPlanData.currency;
    found.period = billingSubscriptionPlanData.period;
    found.originPrice = billingSubscriptionPlanData.originPrice;
    found.discountedAmount = discountedAmount;
    found.billingCouponId = billingCouponId;
    found.billingCouponRemainingApplyCount = billingCouponRemainingApplyCount;
    found.billingSubscriptionPlanSourceId = billingSubscriptionPlanSourceId;
    found.state = 'subscribed';
    await manager.getRepository(BillingSubscriptionPlanInfo).save(found);
    return {
      ok: true,
      subscriptionPlanInfo: found,
    };
  }

  const billingSubscriptionPlanInfo = manager.getRepository(BillingSubscriptionPlanInfo).create({
    billingSubscriptionPlanInfoId: v4(),
    billingOrganizationId,
    category: billingSubscriptionPlanData.category,
    type: billingSubscriptionPlanData.type,
    option: billingSubscriptionPlanData.option,
    currency: billingSubscriptionPlanData.currency,
    period: billingSubscriptionPlanData.period,
    originPrice: billingSubscriptionPlanData.originPrice,
    discountedAmount,
    billingCouponId: newCoupon ? newCoupon.billingCouponId : null,
    billingCouponRemainingApplyCount: newCoupon ? newCoupon.monthlyApplyCount : null,
    billingSubscriptionPlanSourceId,
    state: 'subscribed',
  });
  await manager.getRepository(BillingSubscriptionPlanInfo).save(billingSubscriptionPlanInfo);
  logger.info('createSubscriptionPlanInfo', { billingSubscriptionPlanInfo });
  return {
    ok: true,
    subscriptionPlanInfo: billingSubscriptionPlanInfo,
  };
}
