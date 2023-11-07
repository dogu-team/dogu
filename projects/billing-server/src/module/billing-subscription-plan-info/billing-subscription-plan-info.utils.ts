import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';

export function clearChangeRequested(billingSubscriptionPlanInfo: BillingSubscriptionPlanInfo): void {
  billingSubscriptionPlanInfo.changeRequestedOption = null;
  billingSubscriptionPlanInfo.changeRequestedPeriod = null;
  billingSubscriptionPlanInfo.changeRequestedOriginPrice = null;
  billingSubscriptionPlanInfo.changeRequestedDiscountedAmount = null;
}
