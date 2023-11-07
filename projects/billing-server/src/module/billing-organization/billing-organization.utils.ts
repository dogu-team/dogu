import { BillingOrganization } from '../../db/entity/billing-organization.entity';

export function isMonthlySubscriptionExpiredOrNull(billingOrganization: BillingOrganization, now: Date): boolean {
  if (billingOrganization.subscriptionMonthlyExpiredAt === null) {
    return true;
  }

  return billingOrganization.subscriptionMonthlyExpiredAt < now;
}

export function isYearlySubscriptionExpiredOrNull(billingOrganization: BillingOrganization, now: Date): boolean {
  if (billingOrganization.subscriptionYearlyExpiredAt === null) {
    return true;
  }

  return billingOrganization.subscriptionYearlyExpiredAt < now;
}
