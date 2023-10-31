import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { CloudLicenseBase, SelfHostedLicenseBase } from '..';

export interface BillingMethodNiceBase {
  billingMethodNiceId: string;
  currency: string;
  bid: string | null;
  cloudLicenseId: string | null;
  selfHostedLicenseId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  cloudLicense?: CloudLicenseBase;
  selfHostedLicense?: SelfHostedLicenseBase;
}

export const BillingMethodNicePropCamel = propertiesOf<BillingMethodNiceBase>();
export const BillingMethodNicePropSnake = camelToSnakeCasePropertiesOf<BillingMethodNiceBase>();
