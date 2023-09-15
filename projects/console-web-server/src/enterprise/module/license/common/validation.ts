import { DEFAULT_SELF_HOSTED_LICENSE_DATA, LicenseBase } from '@dogu-private/console';
import { HttpException, HttpStatus } from '@nestjs/common';
import { FEATURE_CONFIG } from '../../../../feature.config';
import { TokenService } from '../../../../module/token/token.service';

export module LicenseValidator {
  export function isLicenseExpiration(license: LicenseBase): boolean {
    const expiredAt = license.licenseToken ? license.licenseToken.expiredAt : null;
    const isExpired = TokenService.isExpired(expiredAt);
    if (isExpired) {
      return true;
    }
    return false;
  }

  export function validateDeviceCount(license: LicenseBase, deviceCount: number): void {
    if (FEATURE_CONFIG.get('licenseModule') === 'cloud') {
      return;
    }

    const isExpired = isLicenseExpiration(license);
    if (isExpired) {
      const defaultDeviceCount = DEFAULT_SELF_HOSTED_LICENSE_DATA.licenseTier?.deviceCount;
      if (defaultDeviceCount! < deviceCount) {
        throw new HttpException(`License device count is not enough. license device count: ${defaultDeviceCount}`, HttpStatus.PAYMENT_REQUIRED);
      }
    }

    if (license.licenseTier!.deviceCount < deviceCount) {
      throw new HttpException(`License device count is not enough. license device count: ${license.licenseTier!.deviceCount}`, HttpStatus.PAYMENT_REQUIRED);
    }
  }

  export function validateOpenApiEnabled(license: LicenseBase): void {
    if (FEATURE_CONFIG.get('licenseModule') === 'cloud') {
      return;
    }
    const isExpired = isLicenseExpiration(license);
    if (isExpired) {
      const defaultOpenApiEnabled = DEFAULT_SELF_HOSTED_LICENSE_DATA.licenseTier?.openApiEnabled;
      if (!defaultOpenApiEnabled) {
        throw new HttpException(`This License is not enabled. License Tier: ${license.licenseTier!.name}`, HttpStatus.PAYMENT_REQUIRED);
      }
    }

    if (!license.licenseTier!.openApiEnabled) {
      throw new HttpException(`This License is not enabled. License Tier: ${license.licenseTier!.name}`, HttpStatus.PAYMENT_REQUIRED);
    }
  }

  export function validateDoguAgentAutoUpdateEnabled(license: LicenseBase): void {
    if (FEATURE_CONFIG.get('licenseModule') === 'cloud') {
      return;
    }

    const isExpired = isLicenseExpiration(license);
    if (isExpired) {
      const defaultDoguAgentAutoUpdateEnabled = DEFAULT_SELF_HOSTED_LICENSE_DATA.licenseTier?.doguAgentAutoUpdateEnabled;
      if (!defaultDoguAgentAutoUpdateEnabled) {
        throw new HttpException(`License dogu agent auto update is not enabled.`, HttpStatus.PAYMENT_REQUIRED);
      }
    }

    if (!license.licenseTier!.doguAgentAutoUpdateEnabled) {
      throw new HttpException(`License dogu agent auto update is not enabled.`, HttpStatus.PAYMENT_REQUIRED);
    }
  }
}
