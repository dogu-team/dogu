import { categoryFromPlatform, isValidPlatformType, PlatformType } from "@dogu-private/types";

export function parseEnv_DOGU_DEVICE_PLATFORM_ENABLED(DOGU_DEVICE_PLATFORM_ENABLED?: string): PlatformType[] {
  const resolvedValue = DOGU_DEVICE_PLATFORM_ENABLED ?? process.env.DOGU_DEVICE_PLATFORM_ENABLED ?? '';
  const enabledPlatforms =  resolvedValue.split(',').map((platform) => {
    if (!isValidPlatformType(platform)) {
      throw new Error(`invalid platform type: ${platform}`);
    }
    return platform;
  });
  return enabledPlatforms;
}

export function isDesktopEnabled(enabledPlatforms: PlatformType[]): boolean {
  return enabledPlatforms.some((platform) => categoryFromPlatform(platform) === 'desktop');
}

export function isMobileEnabled(enabledPlatforms: PlatformType[]): boolean {
  return enabledPlatforms.some((platform) => categoryFromPlatform(platform) === 'mobile');
}

export function isAndroidEnabled(enabledPlatforms: PlatformType[]): boolean {
  return enabledPlatforms.includes('android');
}

export function isIosEnabled(enabledPlatforms: PlatformType[]): boolean {
  return enabledPlatforms.includes('ios');
}

export function isMacosEnabled(enabledPlatforms: PlatformType[]): boolean {
  return enabledPlatforms.includes('macos');
}

export function isLinuxEnabled(enabledPlatforms: PlatformType[]): boolean {
  return enabledPlatforms.includes('linux');
}

export function isWindowsEnabled(enabledPlatforms: PlatformType[]): boolean {
  return enabledPlatforms.includes('windows');
}

export class PlatformAbility {
  enabledPlatforms: PlatformType[] = [];

  constructor(DOGU_DEVICE_PLATFORM_ENABLED?: string) {
    this.enabledPlatforms = parseEnv_DOGU_DEVICE_PLATFORM_ENABLED(DOGU_DEVICE_PLATFORM_ENABLED);
  }

  get isDesktopEnabled(): boolean {
    return isDesktopEnabled(this.enabledPlatforms);
  }

  get isMobileEnabled(): boolean {
    return isMobileEnabled(this.enabledPlatforms);
  }

  get isAndroidEnabled(): boolean {
    return isAndroidEnabled(this.enabledPlatforms);
  }

  get isIosEnabled(): boolean {
    return isIosEnabled(this.enabledPlatforms);
  }

  get isMacosEnabled(): boolean {
    return isMacosEnabled(this.enabledPlatforms);
  }

  get isLinuxEnabled(): boolean {
    return isLinuxEnabled(this.enabledPlatforms);
  }

  get isWindowsEnabled(): boolean {
    return isWindowsEnabled(this.enabledPlatforms);
  }
}
