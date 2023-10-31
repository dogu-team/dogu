import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { CloudLicenseBase, CloudSubscriptionPlanType } from '..';
import { BillingCurrency, BillingPeriod } from './billing';

export interface CloudSubscriptionPlanCustomOptionBase {
  cloudSubscriptionPlanCustomOptionId: string;
  type: CloudSubscriptionPlanType;
  option: number;
  currency: BillingCurrency;
  period: BillingPeriod;
  price: number;
  cloudLicenseId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  cloudLicense?: CloudLicenseBase;
}

export const CloudSubscriptionPlanCustomOptionPropCamel = propertiesOf<CloudSubscriptionPlanCustomOptionBase>();
export const CloudSubscriptionPlanCustomOptionPropSnake = camelToSnakeCasePropertiesOf<CloudSubscriptionPlanCustomOptionBase>();
