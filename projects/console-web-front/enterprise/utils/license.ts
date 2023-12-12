import { COMMUNITY_LICENSE_KEY, SelfHostedLicenseResponse } from '@dogu-private/console';

export const checkExpired = (licenseInfo: SelfHostedLicenseResponse): boolean => {
  return !!licenseInfo?.expiredAt && new Date(licenseInfo.expiredAt) < new Date();
};

export const checkCommunityEdition = (licenseInfo: SelfHostedLicenseResponse): boolean => {
  if (licenseInfo.licenseKey === COMMUNITY_LICENSE_KEY) {
    return true;
  } else if (checkExpired(licenseInfo)) {
    return true;
  }

  return false;
};
