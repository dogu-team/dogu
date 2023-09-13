import { LicenseBase } from '../..';
import { OrganizationBase } from '../../base/organization';

export interface OrganizationResponse extends OrganizationBase {
  licenseInfo: LicenseBase;
}
