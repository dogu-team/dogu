import { BillingResultCode, BillingSubscriptionPlanData } from '@dogu-private/console';
import { v4 } from 'uuid';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { RetrySerializeContext } from '../../db/utils';
import { UseCouponResult } from '../billing-coupon/billing-coupon.serializables';

export interface CreateOrUpdateBillingSubscriptionPlanInfoOptions {
  billingOrganizationId: string;
  data: BillingSubscriptionPlanData;
  discountedAmount: number;
  useCouponResult: UseCouponResult;
  billingSubscriptionPlanSourceId: string | null;
}

export interface CreateOrUpdateBillingSubscriptionPlanInfoResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CreateOrUpdateBillingSubscriptionPlanInfoResultSuccess {
  ok: true;
  billingSubscriptionPlanInfo: BillingSubscriptionPlanInfo;
}

export type CreateOrUpdateBillingSubscriptionPlanInfoResult = CreateOrUpdateBillingSubscriptionPlanInfoResultFailure | CreateOrUpdateBillingSubscriptionPlanInfoResultSuccess;

export async function createOrUpdateBillingSubscriptionPlanInfo(
  context: RetrySerializeContext,
  options: CreateOrUpdateBillingSubscriptionPlanInfoOptions,
): Promise<CreateOrUpdateBillingSubscriptionPlanInfoResult> {
  const { logger, manager } = context;
  const { billingOrganizationId, data, discountedAmount, billingSubscriptionPlanSourceId, useCouponResult } = options;
  const { currency, period, type, category, option, originPrice } = data;
  const { billingCouponId, billingCouponRemainingApplyCount } = useCouponResult;

  const found = await manager.getRepository(BillingSubscriptionPlanInfo).findOne({
    where: {
      billingOrganizationId,
      type,
    },
  });

  if (found) {
    found.category = category;
    found.option = option;
    found.currency = currency;
    found.period = period;
    found.originPrice = originPrice;
    found.discountedAmount = discountedAmount;
    found.billingCouponId = billingCouponId;
    found.billingCouponRemainingApplyCount = billingCouponRemainingApplyCount;
    found.billingSubscriptionPlanSourceId = billingSubscriptionPlanSourceId;
    found.state = 'subscribed';
    const saved = await manager.getRepository(BillingSubscriptionPlanInfo).save(found);
    logger.info('updateSubscriptionPlanInfo', { billingSubscriptionPlanInfo: saved });
    return {
      ok: true,
      billingSubscriptionPlanInfo: saved,
    };
  }

  const billingSubscriptionPlanInfo = manager.getRepository(BillingSubscriptionPlanInfo).create({
    billingSubscriptionPlanInfoId: v4(),
    billingOrganizationId,
    category,
    type,
    option,
    currency,
    period,
    originPrice,
    discountedAmount,
    billingCouponId,
    billingCouponRemainingApplyCount,
    billingSubscriptionPlanSourceId,
    state: 'subscribed',
  });
  const saved = await manager.getRepository(BillingSubscriptionPlanInfo).save(billingSubscriptionPlanInfo);
  logger.info('createSubscriptionPlanInfo', { billingSubscriptionPlanInfo: saved });
  return {
    ok: true,
    billingSubscriptionPlanInfo: saved,
  };
}
