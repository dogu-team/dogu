import { COMMUNITY_LICENSE_KEY, SelfHostedLicenseBase } from '@dogu-private/console';

export module LicenseValidator {
  export function isCommunityEdition(license: SelfHostedLicenseBase): boolean {
    return license.licenseKey === COMMUNITY_LICENSE_KEY;
  }
}
