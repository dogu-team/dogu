import { LicenseBase } from '@dogu-private/console';

export const checkExpired = (licenseInfo: LicenseBase): boolean => {
  return !!licenseInfo?.licenseToken?.expiredAt && new Date(licenseInfo.licenseToken.expiredAt) < new Date();
};
