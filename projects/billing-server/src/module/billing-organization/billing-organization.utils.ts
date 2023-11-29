import { BillingCurrency, BillingMethod, BillingPeriod } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { BadRequestException } from '@nestjs/common';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';

export function isMonthlySubscriptionExpiredOrNull(organization: BillingOrganization, now: Date): boolean {
  if (organization.subscriptionMonthlyExpiredAt === null) {
    return true;
  }

  return organization.subscriptionMonthlyExpiredAt < now;
}

export function isYearlySubscriptionExpiredOrNull(organization: BillingOrganization, now: Date): boolean {
  if (organization.subscriptionYearlyExpiredAt === null) {
    return true;
  }

  return organization.subscriptionYearlyExpiredAt < now;
}

export function invalidateBillingOrganization(organization: BillingOrganization, period: BillingPeriod): BillingOrganization {
  switch (period) {
    case 'monthly': {
      organization.subscriptionMonthlyStartedAt = null;
      organization.subscriptionMonthlyExpiredAt = null;
      organization.graceExpiredAt = null;
      organization.graceNextPurchasedAt = null;
      break;
    }
    case 'yearly': {
      organization.subscriptionYearlyStartedAt = null;
      organization.subscriptionYearlyExpiredAt = null;
      organization.subscriptionMonthlyStartedAt = null;
      organization.subscriptionMonthlyExpiredAt = null;
      organization.graceExpiredAt = null;
      organization.graceNextPurchasedAt = null;
      break;
    }
    default: {
      assertUnreachable(period);
    }
  }

  return organization;
}

export function validateMethod(organization: BillingOrganization, method: BillingMethod): void {
  if (organization.billingMethod === null) {
    return;
  }

  if (organization.billingMethod !== method) {
    throw new BadRequestException({
      message: 'Do not mix billing methods',
      organizationMethod: organization.billingMethod,
      method,
    });
  }
}

export function updateMethod(organization: BillingOrganization, method: BillingMethod): void {
  if (organization.billingMethod !== null) {
    return;
  }

  organization.billingMethod = method;
}

export function validateCurrency(organization: BillingOrganization, currency: BillingCurrency): void {
  if (organization.currency === null) {
    return;
  }

  if (organization.currency !== currency) {
    throw new BadRequestException({
      message: 'Do not mix currencies',
      organizationCurrency: organization.currency,
      currency,
    });
  }
}

export function updateCurrency(organization: BillingOrganization, currency: BillingCurrency): void {
  if (organization.currency !== null) {
    return;
  }

  organization.currency = currency;
}
