import { BillingSubscriptionPlanInfoResponse, BillingSubscriptionPlanType } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';

export module BillingSubscriptionPlanInfoCommonModule {
  export function createPlanInfoResponse(billingOrganization: BillingOrganization, planInfo: BillingSubscriptionPlanInfo): BillingSubscriptionPlanInfoResponse {
    const response = planInfo as BillingSubscriptionPlanInfoResponse;
    const monthlyExpiredAt = billingOrganization.subscriptionMonthlyExpiredAt ?? null;
    const yearlyExpiredAt = billingOrganization.subscriptionYearlyExpiredAt ?? null;

    if (planInfo.state === 'unsubscribed') {
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

  export const planTypeDescriptionMap: Record<BillingSubscriptionPlanType, string> = {
    'live-testing': 'Live Testing',
  };

  export const planOptionDescriptionMap: Record<
    BillingSubscriptionPlanType,
    {
      singular: string;
      plural: string;
    }
  > = {
    'live-testing': {
      singular: 'parallel session',
      plural: 'parallel sessions',
    },
  };
}
