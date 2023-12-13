import { BillingAddress, BillingBusiness, BillingMethodPaddleResponse, BillingOrganizationResponse, BillingPlanInfoResponse, BillingPlanType } from '@dogu-private/console';
import { assertUnreachable } from '@dogu-tech/common';
import { BillingOrganization } from '../../db/entity/billing-organization.entity';
import { BillingPlanInfo } from '../../db/entity/billing-plan-info.entity';
import { Paddle } from '../paddle/paddle.types';

export class BillingPlanInfoResponseBuilder {
  constructor(
    private readonly billingOrganization: BillingOrganization,
    private readonly paddleSubscriptions: Paddle.Subscription[],
  ) {}

  build(planInfo: BillingPlanInfo): BillingPlanInfoResponse {
    const { billingOrganization, paddleSubscriptions } = this;
    const { subscriptionMonthlyExpiredAt, subscriptionYearlyExpiredAt, billingMethod } = billingOrganization;
    const response = planInfo as BillingPlanInfoResponse;
    if (planInfo.state === 'unsubscribed') {
      response.expiredAt = null;
    } else {
      switch (billingMethod) {
        case null:
        case 'nice': {
          switch (response.period) {
            case 'monthly': {
              response.expiredAt = subscriptionMonthlyExpiredAt;
              break;
            }
            case 'yearly': {
              response.expiredAt = subscriptionYearlyExpiredAt;
              break;
            }
            default: {
              assertUnreachable(response.period);
            }
          }
          break;
        }
        case 'paddle': {
          const paddleSubscription = paddleSubscriptions.find((subscription) => subscription.custom_data?.billingPlanInfoId === planInfo.billingPlanInfoId);
          if (!paddleSubscription) {
            throw new Error(`Paddle subscription not found. billingPlanInfoId: ${planInfo.billingPlanInfoId}`);
          }
          if (!paddleSubscription.current_billing_period) {
            throw new Error(`Paddle subscription currentBillingPeriod not found. billingPlanInfoId: ${planInfo.billingPlanInfoId}`);
          }
          if (!paddleSubscription.current_billing_period.ends_at) {
            throw new Error(`Paddle subscription expiredAt not found. billingPlanInfoId: ${planInfo.billingPlanInfoId}`);
          }
          response.expiredAt = new Date(paddleSubscription.current_billing_period.ends_at);
          break;
        }
        default: {
          assertUnreachable(billingMethod);
        }
      }
    }

    return response;
  }
}

export class BillingOrganizationResponseBuilder {
  constructor(
    private readonly billingOrganization: BillingOrganization,
    private readonly paddleSubscriptions: Paddle.Subscription[],
    private readonly paddleAddresses: Paddle.Address[],
    private readonly paddleBusinesses: Paddle.Business[],
  ) {}

  build(): BillingOrganizationResponse {
    const { billingOrganization, paddleSubscriptions, paddleAddresses } = this;
    const planInfoResponseBuilder = new BillingPlanInfoResponseBuilder(billingOrganization, paddleSubscriptions);
    const billingPlanInfos = billingOrganization.billingPlanInfos ?? [];
    billingOrganization.billingPlanInfos = billingPlanInfos.map((planInfo) => {
      return planInfoResponseBuilder.build(planInfo);
    });

    if (billingOrganization.billingMethodPaddle) {
      const billingMethodPaddle = billingOrganization.billingMethodPaddle as BillingMethodPaddleResponse;

      const paddleAddress = paddleAddresses[0];
      if (paddleAddress) {
        const address: BillingAddress = {
          firstLine: paddleAddress.first_line ?? null,
          secondLine: paddleAddress.second_line ?? null,
          city: paddleAddress.city ?? null,
          postalCode: paddleAddress.postal_code ?? null,
          region: paddleAddress.region ?? null,
          countryCode: paddleAddress.country_code ?? null,
        };
        billingMethodPaddle.address = address;
      }

      const paddleBusiness = this.paddleBusinesses[0];
      if (paddleBusiness) {
        const business: BillingBusiness = {
          name: paddleBusiness.name ?? null,
          companyNumber: paddleBusiness.company_number ?? null,
          taxIdentifier: paddleBusiness.tax_identifier ?? null,
        };
        billingMethodPaddle.business = business;
      }
    }

    return billingOrganization as BillingOrganizationResponse;
  }
}

export namespace BillingPlanInfoCommonModule {
  export const planTypeDescriptionMap: Record<BillingPlanType, string> = {
    'live-testing': 'Live Testing',
    'web-test-automation': 'Web Test Automation',
    'mobile-app-test-automation': 'Mobile App Test Automation',
    'mobile-game-test-automation': 'Mobile Game Test Automation',
    'self-device-farm-browser': 'Self Device Farm Browser',
    'self-device-farm-mobile': 'Self Device Farm Mobile',
  };

  export const planOptionDescriptionMap: Record<
    BillingPlanType,
    {
      singular: string;
      plural: string;
    }
  > = {
    'live-testing': {
      singular: 'parallel session',
      plural: 'parallel sessions',
    },
    'web-test-automation': {
      singular: 'parallel test',
      plural: 'parallel tests',
    },
    'mobile-app-test-automation': {
      singular: 'parallel test',
      plural: 'parallel tests',
    },
    'mobile-game-test-automation': {
      singular: 'parallel test',
      plural: 'parallel tests',
    },
    'self-device-farm-browser': {
      singular: 'browser',
      plural: 'browsers',
    },
    'self-device-farm-mobile': {
      singular: 'device',
      plural: 'devices',
    },
  };
}
