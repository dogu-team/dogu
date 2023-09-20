import { LicenseBase, LicenseResponse } from '@dogu-private/console';

export const COMMUNITY_MAX_BROWSER_COUNT = 2;
export const COMMUNITY_MAX_MOBILE_COUNT = 2;

export const LICENSE_DOCS_URL = 'https://docs.dogutech.io/get-started/installation/self-hosted/license';

export const checkExpired = (licenseInfo: LicenseBase): boolean => {
  return !!licenseInfo?.licenseToken?.expiredAt && new Date(licenseInfo.licenseToken.expiredAt) < new Date();
};

export const checkCommunityEdition = (licenseInfo: LicenseResponse): boolean => {
  if (licenseInfo.isCommunityEdition) {
    return true;
  } else if (checkExpired(licenseInfo)) {
    return true;
  }

  return false;
};
