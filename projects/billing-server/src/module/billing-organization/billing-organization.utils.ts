import { BillingPeriod } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
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

export function invalidateBillingOrganization(billingOrganization: BillingOrganization, period: BillingPeriod): BillingOrganization {
  switch (period) {
    case 'monthly': {
      billingOrganization.subscriptionMonthlyStartedAt = null;
      billingOrganization.subscriptionMonthlyExpiredAt = null;
      billingOrganization.graceExpiredAt = null;
      billingOrganization.graceNextPurchasedAt = null;
      break;
    }
    case 'yearly': {
      billingOrganization.subscriptionYearlyStartedAt = null;
      billingOrganization.subscriptionYearlyExpiredAt = null;
      billingOrganization.subscriptionMonthlyStartedAt = null;
      billingOrganization.subscriptionMonthlyExpiredAt = null;
      billingOrganization.graceExpiredAt = null;
      billingOrganization.graceNextPurchasedAt = null;
      break;
    }
    default: {
      assertUnreachable(period);
    }
  }

  return billingOrganization;
}
