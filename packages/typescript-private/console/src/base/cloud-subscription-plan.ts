import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { CloudLicenseBase } from './cloud-license';

export const CloudSubscriptionPlanType = ['live-testing'] as const;
export type CloudSubscriptionPlanType = (typeof CloudSubscriptionPlanType)[number];

export const CloudSubscriptionPlanCurrency = ['krw'] as const;
export type CloudSubscriptionPlanCurrency = (typeof CloudSubscriptionPlanCurrency)[number];

export interface CloudSubscriptionPlanPrice {
  monthly: number;
  yearly: number;
}

export interface CloudSubscriptionPlanInfo {
  priceMap: Record<CloudSubscriptionPlanCurrency, CloudSubscriptionPlanPrice>;
}

export const CloudSubscriptionPlanMap: Record<CloudSubscriptionPlanType, CloudSubscriptionPlanInfo> = {
  'live-testing': {
    priceMap: {
      krw: {
        monthly: 10000,
        yearly: 100000,
      },
    },
  },
};

export interface CloudSubscriptionPlanBase {
  cloudSubscriptionPlanId: string;
  type: CloudSubscriptionPlanType;
  cloudLicenseId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  cloudLicense?: CloudLicenseBase;
}

export const CloudSubscriptionPlanPropCamel = propertiesOf<CloudSubscriptionPlanBase>();
export const CloudSubscriptionPlanPropSnake = camelToSnakeCasePropertiesOf<CloudSubscriptionPlanBase>();
