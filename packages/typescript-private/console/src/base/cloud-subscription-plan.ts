import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { BillingCurrency, BillingPeriod, SubscriptionPlanPriceMap } from './billing';
import { CloudLicenseBase } from './cloud-license';

export const CloudSubscriptionPlanType = ['live-testing'] as const;
export type CloudSubscriptionPlanType = (typeof CloudSubscriptionPlanType)[number];

export interface LiveTestingCloudSubscriptionPlan {
  type: 'live-testing';
  optionMap: Record<number, SubscriptionPlanPriceMap>;
}

export interface CloudSubscriptionPlanInfo {
  optionMap: Record<number, Record<BillingCurrency, LiveTestingCloudSubscriptionPlan>>;
}

// export const CloudSubscriptionPlanMap: Record<CloudSubscriptionPlanType, CloudSubscriptionPlanInfo> = {
//   'live-testing': {
//     priceMap: {
//       krw: {
//         monthly: 10000,
//         yearly: 100000,
//       },
//     },
//   },
// };

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
