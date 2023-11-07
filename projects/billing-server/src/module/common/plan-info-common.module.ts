import { BillingSubscriptionPlanInfoResponse } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';

export module BillingSubscriptionPlanInfoCommonModule {
  export function createPlanInfoResponse(billingOrganization: BillingOrganization, planInfo: BillingSubscriptionPlanInfo): BillingSubscriptionPlanInfoResponse {
    const response = planInfo as BillingSubscriptionPlanInfoResponse;
    const monthlyExpiredAt = response.billingOrganization?.subscriptionMonthlyExpiredAt ?? null;
    const yearlyExpiredAt = response.billingOrganization?.subscriptionYearlyExpiredAt ?? null;

    if (planInfo.state === 'unsubscribe-requested' || planInfo.state === 'unsubscribed') {
      response.monthlyExpiredAt = null;
      response.yearlyExpiredAt = null;
    } else {
      switch (response.period) {
        case 'monthly': {
          response.monthlyExpiredAt = monthlyExpiredAt;
          break;
        }
        case 'yearly': {
          response.yearlyExpiredAt = yearlyExpiredAt;
          break;
        }
        default: {
          assertUnreachable(response.period);
        }
      }
    }

    return response;
  }
}
