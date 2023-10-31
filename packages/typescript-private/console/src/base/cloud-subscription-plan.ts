import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { CloudLicenseBase } from './cloud-license';

export const CloudSubscriptionPlanType = ['live-testing'] as const;
export type CloudSubscriptionPlanType = (typeof CloudSubscriptionPlanType)[number];

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
