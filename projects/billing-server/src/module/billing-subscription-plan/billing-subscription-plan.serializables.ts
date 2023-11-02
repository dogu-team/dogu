import { BillingResultCode, BillingSubscriptionPlanSourceData, resultCode } from '@dogu-private/console';
import { In } from 'typeorm';
import { v4 } from 'uuid';
import { BillingSubscriptionPlan } from '../../db/entity/billing-subscription-plan.entity';
import { RetrySerializeContext } from '../../db/utils';

export interface CreateSubscriptionPlanDto {
  billingOrganizationId: string;
  subscriptionPlanSourceData: BillingSubscriptionPlanSourceData;
  lastPurchasedPrice: number;
}

export interface CreateSubscriptionPlanResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface CreateSubscriptionPlanResultSuccess {
  ok: true;
  resultCode: BillingResultCode;
  subscriptionPlan: BillingSubscriptionPlan;
}

export type CreateSubscriptionPlanResult = CreateSubscriptionPlanResultFailure | CreateSubscriptionPlanResultSuccess;

export async function createSubscriptionPlan(context: RetrySerializeContext, dto: CreateSubscriptionPlanDto): Promise<CreateSubscriptionPlanResult> {
  const { logger, manager } = context;
  const { billingOrganizationId, subscriptionPlanSourceData, lastPurchasedPrice } = dto;
  const billingSubscriptionPlan = manager.getRepository(BillingSubscriptionPlan).create({
    billingSubscriptionPlanId: v4(),
    billingOrganizationId,
    category: subscriptionPlanSourceData.category,
    type: subscriptionPlanSourceData.type,
    option: subscriptionPlanSourceData.option,
    currency: subscriptionPlanSourceData.currency,
    period: subscriptionPlanSourceData.period,
    originPrice: subscriptionPlanSourceData.originPrice,

    // TODO: recalculate price logic
    lastPurchasedPrice,
  });
  await manager.getRepository(BillingSubscriptionPlan).save(billingSubscriptionPlan);
  logger.info('createSubscriptionPlan', { billingSubscriptionPlan });
  return {
    ok: true,
    resultCode: resultCode('ok'),
    subscriptionPlan: billingSubscriptionPlan,
  };
}

export async function unsubscribeRemainingSubscriptionPlans(context: RetrySerializeContext, remainingSubscriptionPlanIds: string[]): Promise<void> {
  const { manager } = context;
  await manager.getRepository(BillingSubscriptionPlan).update(
    {
      billingSubscriptionPlanId: In(remainingSubscriptionPlanIds),
    },
    {
      unsubscribedAt: new Date(),
    },
  );
}
