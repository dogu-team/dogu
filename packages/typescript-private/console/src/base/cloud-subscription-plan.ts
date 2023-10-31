import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { BillingPeriod, SubscriptionPlanPriceMap } from './billing';
import { CloudLicenseBase } from './cloud-license';

export const CloudSubscriptionPlanType = ['live-testing'] as const;
export type CloudSubscriptionPlanType = (typeof CloudSubscriptionPlanType)[number];

export interface CloudSubscriptionPlanInfo {
  optionMap: Record<number, SubscriptionPlanPriceMap>;
}

export const CloudSubscriptionPlanMap: Record<CloudSubscriptionPlanType, CloudSubscriptionPlanInfo> = {
  'live-testing': {
    optionMap: {
      1: {
        krw: {
          monthly: 10000,
          yearly: 100000,
        },
      },
      2: {
        krw: {
          monthly: 20000,
          yearly: 200000,
        },
      },
    },
  },
};

export interface CloudSubscriptionPlanBase {
  cloudSubscriptionPlanId: string;
  type: CloudSubscriptionPlanType;
  period: BillingPeriod;
  cloudLicenseId: string;
  billingCouponId: string | null;
  billingCouponRemainingApplyCount: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  cloudLicense?: CloudLicenseBase;
}

export const CloudSubscriptionPlanPropCamel = propertiesOf<CloudSubscriptionPlanBase>();
export const CloudSubscriptionPlanPropSnake = camelToSnakeCasePropertiesOf<CloudSubscriptionPlanBase>();
