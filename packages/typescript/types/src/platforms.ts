import { Platform } from './protocol/generated/tsproto/outer/platform';

export const PlatformType = ['unspecified', 'android', 'ios', 'macos', 'windows', 'ps4', 'xbox'] as const;
export type PlatformType = (typeof PlatformType)[number];

export const PlatformCategory = ['unspecified', 'desktop', 'mobile', 'console'] as const;
export type PlatformCategory = (typeof PlatformCategory)[number];

export function categoryFromPlatform(platform: PlatformType): PlatformCategory {
  switch (platform) {
    case 'android':
    case 'ios':
      return 'mobile';
    case 'macos':
    case 'windows':
      return 'desktop';
    case 'ps4':
    case 'xbox':
      return 'console';
    default:
      return 'unspecified';
  }
}

export function platformTypeFromPlatform(platform: Platform): PlatformType {
  switch (platform) {
    case Platform.PLATFORM_ANDROID:
      return 'android';
    case Platform.PLATFORM_IOS:
      return 'ios';
    case Platform.PLATFORM_MACOS:
      return 'macos';
    case Platform.PLATFORM_WINDOWS:
      return 'windows';
    case Platform.PLATFORM_PS4:
      return 'ps4';
    case Platform.PLATFORM_XBOX:
      return 'xbox';
    default:
      return 'unspecified';
  }
}

export function platformFromPlatformType(platform: PlatformType): Platform {
  switch (platform) {
    case 'android':
      return Platform.PLATFORM_ANDROID;
    case 'ios':
      return Platform.PLATFORM_IOS;
    case 'macos':
      return Platform.PLATFORM_MACOS;
    case 'windows':
      return Platform.PLATFORM_WINDOWS;
    case 'ps4':
      return Platform.PLATFORM_PS4;
    case 'xbox':
      return Platform.PLATFORM_XBOX;
    default:
      return Platform.PLATFORM_UNSPECIFIED;
  }
}

export function extensionFromPlatform(platform: PlatformType): string {
  const lower = platform.toLowerCase();
  switch (lower) {
    case 'android':
      return 'apk';
    case 'ios':
      return 'ipa';
    case 'windows':
      return 'exe';
    case 'mac':
      return 'dmg';
    default:
      throw new Error(`Invalid platform: ${platform}`);
  }
}
