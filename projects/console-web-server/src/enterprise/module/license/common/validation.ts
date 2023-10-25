// import { DEFAULT_SELF_HOSTED_LICENSE_DATA, DevicePropCamel, DevicePropSnake, LicenseBase } from '@dogu-private/console';

// import { FeatureLicenseService } from '../feature-license.service';

export module LicenseValidator {
  // export function isLicenseExpiration(license: LicenseBase): boolean {
  //   const expiredAt = license.licenseToken ? license.licenseToken.expiredAt : null;
  //   const isExpired = TokenService.isExpired(expiredAt);
  //   if (isExpired) {
  //     return true;
  //   }
  //   return false;
  // }
  // export async function enabledMobileDevices(manager: EntityManager) {
  //   if (FEATURE_CONFIG.get('licenseModule') !== 'self-hosted') {
  //     throw new HttpException(`This Action is not allowed.`, HttpStatus.FORBIDDEN);
  //   }
  //   const mobildDevices = await manager
  //     .getRepository(Device) //
  //     .createQueryBuilder('device')
  //     .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
  //     .where(`device.${DevicePropSnake.is_host} = :${DevicePropCamel.isHost}`, { isHost: 0 })
  //     .getMany();
  //   const globalDevices = mobildDevices.filter((device) => device.isGlobal === 1);
  //   const projectDevices = mobildDevices.filter((device) => {
  //     return device.isGlobal === 0 && device.projectAndDevices && device.projectAndDevices.length > 0;
  //   });
  //   const enabledMobildDevices = [...globalDevices, ...projectDevices];
  //   return enabledMobildDevices;
  // }
  // export async function enabledHostDevices(manager: EntityManager) {
  //   if (FEATURE_CONFIG.get('licenseModule') !== 'self-hosted') {
  //     throw new HttpException(`This Action is not allowed.`, HttpStatus.FORBIDDEN);
  //   }
  //   const hostDevices = await manager
  //     .getRepository(Device) //
  //     .createQueryBuilder('device')
  //     .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
  //     .where(`device.${DevicePropSnake.is_host} = :${DevicePropCamel.isHost}`, { isHost: 1 })
  //     .getMany();
  //   const globalDevices = hostDevices.filter((device) => device.isGlobal === 1);
  //   const projectDevices = hostDevices.filter((device) => {
  //     return device.isGlobal === 0 && device.projectAndDevices && device.projectAndDevices.length > 0;
  //   });
  //   const enabledHostDevices = [...globalDevices, ...projectDevices];
  //   return enabledHostDevices;
  // }
  // export async function validateMobileEnableCount(
  //   manager: EntityManager,
  //   licenseService: FeatureLicenseService,
  //   organizationId: OrganizationId | null,
  //   device: Device,
  // ): Promise<void> {
  //   if (FEATURE_CONFIG.get('licenseModule') === 'cloud') {
  //     return;
  //   }
  //   const curUsedDevices = await enabledMobileDevices(manager);
  //   const curUsedDeviceIds = curUsedDevices.map((device) => device.deviceId);
  //   const isUsingDevice = curUsedDeviceIds.includes(device.deviceId);
  //   if (!isUsingDevice) {
  //     const license = await licenseService.getLicense(organizationId);
  //     const isExpired = isLicenseExpiration(license);
  //     if (isExpired) {
  //       const defaultMobileEnableCount = DEFAULT_SELF_HOSTED_LICENSE_DATA.licenseTier?.enabledMobileCount;
  //       if (defaultMobileEnableCount! < curUsedDevices.length + 1) {
  //         throw new HttpException(`License mobile device count is not enough. license mobile device count: ${defaultMobileEnableCount}`, HttpStatus.PAYMENT_REQUIRED);
  //       }
  //     }
  //     if (license.licenseTier!.enabledMobileCount < curUsedDevices.length + 1) {
  //       throw new HttpException(`License mobile device count is not enough. license mobile device count: ${license.licenseTier!.enabledMobileCount}`, HttpStatus.PAYMENT_REQUIRED);
  //     }
  //   }
  // }
  // export async function validateBrowserEnableCount(
  //   manager: EntityManager,
  //   licenseService: FeatureLicenseService,
  //   organizationId: OrganizationId | null,
  //   device: Device,
  //   updateParrellelJobCount: number,
  // ): Promise<void> {
  //   if (FEATURE_CONFIG.get('licenseModule') === 'cloud') {
  //     return;
  //   }
  //   const curUsedHostedDevice = await enabledHostDevices(manager);
  //   const enabledHostRunnerCount = curUsedHostedDevice.map((device) => device.maxParallelJobs).reduce((a, b) => a + b, 0);
  //   if (device.maxParallelJobs > updateParrellelJobCount) {
  //     return;
  //   }
  //   const isEnabledDevice = device.isGlobal === 1 || (device.projectAndDevices && device.projectAndDevices.length > 0);
  //   const updateCount = isEnabledDevice ? enabledHostRunnerCount - device.maxParallelJobs + updateParrellelJobCount : enabledHostRunnerCount + updateParrellelJobCount;
  //   const license = await licenseService.getLicense(organizationId);
  //   const isExpired = isLicenseExpiration(license);
  //   if (isExpired) {
  //     const defaultBrowserEnableCount = DEFAULT_SELF_HOSTED_LICENSE_DATA.licenseTier?.enabledBrowserCount;
  //     if (defaultBrowserEnableCount! < updateCount) {
  //       throw new HttpException(`License browser device count is not enough. license browser device count: ${defaultBrowserEnableCount}`, HttpStatus.PAYMENT_REQUIRED);
  //     }
  //   }
  //   if (license.licenseTier!.enabledBrowserCount < updateCount) {
  //     throw new HttpException(`License browser device count is not enough. license browser device count: ${license.licenseTier!.enabledBrowserCount}`, HttpStatus.PAYMENT_REQUIRED);
  //   }
  // }
  // export function validateOpenApiEnabled(license: LicenseBase): void {
  //   if (FEATURE_CONFIG.get('licenseModule') === 'cloud') {
  //     return;
  //   }
  //   const isExpired = isLicenseExpiration(license);
  //   if (isExpired) {
  //     const defaultOpenApiEnabled = DEFAULT_SELF_HOSTED_LICENSE_DATA.licenseTier?.openApiEnabled;
  //     if (!defaultOpenApiEnabled) {
  //       throw new HttpException(`This License is not enabled. License Tier: ${license.licenseTier!.name}`, HttpStatus.PAYMENT_REQUIRED);
  //     }
  //   }
  //   if (!license.licenseTier!.openApiEnabled) {
  //     throw new HttpException(`This License is not enabled. License Tier: ${license.licenseTier!.name}`, HttpStatus.PAYMENT_REQUIRED);
  //   }
  // }
  // export function validateDoguAgentAutoUpdateEnabled(license: LicenseBase): void {
  //   if (FEATURE_CONFIG.get('licenseModule') === 'cloud') {
  //     return;
  //   }
  //   const isExpired = isLicenseExpiration(license);
  //   if (isExpired) {
  //     const defaultDoguAgentAutoUpdateEnabled = DEFAULT_SELF_HOSTED_LICENSE_DATA.licenseTier?.doguAgentAutoUpdateEnabled;
  //     if (!defaultDoguAgentAutoUpdateEnabled) {
  //       throw new HttpException(`License dogu agent auto update is not enabled.`, HttpStatus.PAYMENT_REQUIRED);
  //     }
  //   }
  //   if (!license.licenseTier!.doguAgentAutoUpdateEnabled) {
  //     throw new HttpException(`License dogu agent auto update is not enabled.`, HttpStatus.PAYMENT_REQUIRED);
  //   }
  // }
}

/**
 * Cloud
 * 1. create license on create organization
 * 2. get license information
 *
 * Self-hosted
 * 1. 유저가 라이센스 요청(with Spec)
 * 2. 라이센스 키가 유효한지 검증(on save)
 * 3. get license information & 라이센스가 만료되지 않았는지 확인
 * 4. license renew
 *
 * Common
 * 1. Relay
 */
