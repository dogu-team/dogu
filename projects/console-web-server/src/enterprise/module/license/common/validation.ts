import { LicenseBase } from '@dogu-private/console';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TokenService } from '../../../../module/token/token.service';

export module LicenseValidator {
  export function validateLicenseExpiration(license: LicenseBase): void {
    const expiredAt = license.licenseToken ? license.licenseToken.expiredAt : null;
    const isExpired = TokenService.isExpired(expiredAt);
    if (isExpired) {
      throw new HttpException(`License is expired. expiredAt: ${license.licenseToken!.expiredAt}`, HttpStatus.UNAUTHORIZED);
    }
  }

  export function validateDeviceCount(license: LicenseBase, deviceCount: number): void {
    validateLicenseExpiration(license);

    if (license.licenseTier!.deviceCount < deviceCount) {
      throw new HttpException(`License device count is not enough. license device count: ${license.licenseTier!.deviceCount}`, HttpStatus.UNAUTHORIZED);
    }
  }
}
