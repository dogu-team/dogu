import { BillingResultCode, BillingSubscriptionPlanData } from '@dogu-private/console';
import { v4 } from 'uuid';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { RetrySerializeContext } from '../../db/utils';

export interface CreateSubscriptionPlanInfoOptions {
  billingOrganizationId: string;
  subscriptionPlanData: BillingSubscriptionPlanData;
  discountedAmount: number;
  billingCouponId: string | null;
  billingCouponRemainingApplyCount: number | null;
  billingSubscriptionPlanSourceId: string | null;
}

export interface CreateSubscriptionPlanInfoResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CreateSubscriptionPlanInfoResultSuccess {
  ok: true;
  subscriptionPlanInfo: BillingSubscriptionPlanInfo;
}

export type CreateSubscriptionPlanInfoResult = CreateSubscriptionPlanInfoResultFailure | CreateSubscriptionPlanInfoResultSuccess;

export async function createSubscriptionPlanInfo(context: RetrySerializeContext, options: CreateSubscriptionPlanInfoOptions): Promise<CreateSubscriptionPlanInfoResult> {
  const { logger, manager } = context;
  const { billingOrganizationId, subscriptionPlanData, discountedAmount, billingCouponId, billingCouponRemainingApplyCount, billingSubscriptionPlanSourceId } = options;

  const billingSubscriptionPlanInfo = manager.getRepository(BillingSubscriptionPlanInfo).create({
    billingSubscriptionPlanInfoId: v4(),
    billingOrganizationId,
    category: subscriptionPlanData.category,
    type: subscriptionPlanData.type,
    option: subscriptionPlanData.option,
    currency: subscriptionPlanData.currency,
    period: subscriptionPlanData.period,
    originPrice: subscriptionPlanData.originPrice,
    discountedAmount,
    billingCouponId,
    billingCouponRemainingApplyCount,
    billingSubscriptionPlanSourceId,
  });
  await manager.getRepository(BillingSubscriptionPlanInfo).save(billingSubscriptionPlanInfo);
  logger.info('createSubscriptionPlanInfo', { billingSubscriptionPlanInfo });
  return {
    ok: true,
    subscriptionPlanInfo: billingSubscriptionPlanInfo,
  };
}
