import { DEFAULT_SELF_HOSTED_LICENSE_DATA, DevicePropCamel, DevicePropSnake, LicenseBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Device } from '../../../../db/entity/device.entity';
import { FEATURE_CONFIG } from '../../../../feature.config';
import { TokenService } from '../../../../module/token/token.service';
import { FeatureLicenseService } from '../feature-license.service';

export module LicenseValidator {
  export function isLicenseExpiration(license: LicenseBase): boolean {
    const expiredAt = license.licenseToken ? license.licenseToken.expiredAt : null;
    const isExpired = TokenService.isExpired(expiredAt);
    if (isExpired) {
      return true;
    }
    return false;
  }

  export async function validateMobileEnableCount(
    manager: EntityManager,
    licenseService: FeatureLicenseService,
    organizationId: OrganizationId | null,
    device: Device,
  ): Promise<void> {
    if (FEATURE_CONFIG.get('licenseModule') === 'cloud') {
      return;
    }

    const mobildDevices = await manager
      .getRepository(Device) //
      .createQueryBuilder('device')
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
      .where(`device.${DevicePropSnake.is_host} = :${DevicePropCamel.isHost}`, { isHost: 0 })
      .getMany();

    const globalDevices = mobildDevices.filter((device) => device.isGlobal === 1);
    const projectDevices = mobildDevices.filter((device) => {
      return device.isGlobal === 0 && device.projectAndDevices && device.projectAndDevices.length > 0;
    });

    const curUsedDevices = [...globalDevices, ...projectDevices];

    const curUsedDeviceIds = curUsedDevices.map((device) => device.deviceId);
    const isUsingDevice = curUsedDeviceIds.includes(device.deviceId);

    if (!isUsingDevice) {
      const license = await licenseService.getLicense(organizationId);
      const isExpired = isLicenseExpiration(license);
      if (isExpired) {
        const defaultMobileEnableCount = DEFAULT_SELF_HOSTED_LICENSE_DATA.licenseTier?.maxMobileEnableCount;
        if (defaultMobileEnableCount! < curUsedDevices.length + 1) {
          throw new HttpException(`License device count is not enough. license device count: ${defaultMobileEnableCount}`, HttpStatus.PAYMENT_REQUIRED);
        }
      }

      if (license.licenseTier!.maxMobileEnableCount < curUsedDevices.length + 1) {
        throw new HttpException(`License device count is not enough. license device count: ${license.licenseTier!.maxMobileEnableCount}`, HttpStatus.PAYMENT_REQUIRED);
      }
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
