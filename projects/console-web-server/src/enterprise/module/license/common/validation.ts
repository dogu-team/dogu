import { COMMUNITY_LICENSE_KEY, COMMUNITY_MAX_BROWSER_COUNT, COMMUNITY_MAX_MOBILE_COUNT, SelfHostedLicenseBase } from '@dogu-private/console';

import { TokenService } from '../../../../module/token/token.service';

export module SelfHostedLicenseValidator {
  export function isCommunityEdition(license: SelfHostedLicenseBase): boolean {
    return license.licenseKey === COMMUNITY_LICENSE_KEY;
  }

  export function getMaxmiumBrowserCount(license: SelfHostedLicenseBase): number {
    if (SelfHostedLicenseValidator.isCommunityEdition(license)) {
      return COMMUNITY_MAX_BROWSER_COUNT;
    }

    const isExpired = TokenService.isExpired(license.expiredAt);

    return isExpired ? COMMUNITY_MAX_BROWSER_COUNT : license.maximumEnabledBrowserCount;
  }

  export function getMaxmiumMobileCount(license: SelfHostedLicenseBase): number {
    if (SelfHostedLicenseValidator.isCommunityEdition(license)) {
      return COMMUNITY_MAX_MOBILE_COUNT;
    }

    const isExpired = TokenService.isExpired(license.expiredAt);

    return isExpired ? COMMUNITY_MAX_MOBILE_COUNT : license.maximumEnabledMobileCount;
  }
}
