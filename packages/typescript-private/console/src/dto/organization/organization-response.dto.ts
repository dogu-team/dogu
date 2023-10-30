import { CloudLicenseBase, SelfHostedLicenseBase } from '../..';
import { OrganizationBase } from '../../base/organization';

export interface OrganizationResponse extends OrganizationBase {
  licenseInfo?: SelfHostedLicenseBase | CloudLicenseBase;
}
