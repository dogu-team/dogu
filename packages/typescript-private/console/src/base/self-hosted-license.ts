import { OrganizationId } from '@dogu-private/types';
import { propertiesOf } from '@dogu-tech/common';
import { BillingCategory } from '..';

import { BillingOrganizationBase, BillingOrganizationResponse } from './billing-organization';

export interface SelfHostedLicenseBase {
  selfHostedLicenseId: string;
  licenseKey: string;
  organizationId: OrganizationId;
  billingOrganizationId: string;
  maximumEnabledMobileCount: number;
  maximumEnabledBrowserCount: number;
  openApiEnabled: boolean;
  doguAgentAutoUpdateEnabled: boolean;
  category: BillingCategory;
  createdAt: Date;
  updatedAt: Date;
  lastAccessAt: Date;
  expiredAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
}

export const SelfHostedLicenseProp = propertiesOf<SelfHostedLicenseBase>();

export interface SelfHostedLicenseResponse extends SelfHostedLicenseBase {
  billingOrganization: BillingOrganizationResponse;
}
