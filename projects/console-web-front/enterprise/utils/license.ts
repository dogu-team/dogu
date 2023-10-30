import { COMMUNITY_LICENSE_KEY, SelfHostedLicenseBase } from '@dogu-private/console';

export const LICENSE_DOCS_URL = 'https://docs.dogutech.io/get-started/installation/self-hosted/license';

export const checkExpired = (licenseInfo: SelfHostedLicenseBase): boolean => {
  return !!licenseInfo?.expiredAt && new Date(licenseInfo.expiredAt) < new Date();
};

export const checkCommunityEdition = (licenseInfo: SelfHostedLicenseBase): boolean => {
  if (licenseInfo.licenseKey === COMMUNITY_LICENSE_KEY) {
    return true;
  } else if (checkExpired(licenseInfo)) {
    return true;
  }

  return false;
};
