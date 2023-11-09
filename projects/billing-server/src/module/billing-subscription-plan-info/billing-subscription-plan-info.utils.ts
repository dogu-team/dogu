import { EntityManager } from 'typeorm';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';

export function clearChangeRequested(billingSubscriptionPlanInfo: BillingSubscriptionPlanInfo): void {
  billingSubscriptionPlanInfo.changeRequestedOption = null;
  billingSubscriptionPlanInfo.changeRequestedPeriod = null;
  billingSubscriptionPlanInfo.changeRequestedOriginPrice = null;
  billingSubscriptionPlanInfo.changeRequestedDiscountedAmount = null;
}

export async function unlinkBillingSubscriptionPlanInfo(manager: EntityManager, linked: BillingSubscriptionPlanInfo): Promise<void> {
  linked.billingSubscriptionPlanHistoryId = null;
  if (linked.state !== 'unsubscribed') {
    clearChangeRequested(linked);
    linked.state = 'unsubscribed';
    linked.unsubscribedAt = new Date();
  }

  await manager.getRepository(BillingSubscriptionPlanInfo).save(linked);
}
