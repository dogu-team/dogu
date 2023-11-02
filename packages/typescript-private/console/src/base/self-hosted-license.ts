import { OrganizationId } from '@dogu-private/types';
import { propertiesOf } from '@dogu-tech/common';

export interface SelfHostedLicenseBase {
  selfHostedLicenseId: string;
  licenseKey: string;

  /**
   * @deprecated use organizationId instead
   */
  companyName: string | null;
  organizationId: OrganizationId | null;
  maximumEnabledMobileCount: number;
  maximumEnabledBrowserCount: number;
  openApiEnabled: boolean;
  doguAgentAutoUpdateEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessAt: Date;
  expiredAt: Date;
  deletedAt: Date | null;
}

export const SelfHostedLicenseProp = propertiesOf<SelfHostedLicenseBase>();
