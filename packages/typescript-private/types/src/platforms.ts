import { Platform } from './protocol/generated/tsproto/outer/platform';

export const hostPlatforms: Platform[] = [Platform.PLATFORM_MACOS, Platform.PLATFORM_WINDOWS];

export function isHostPlatform(platform: Platform): boolean {
  return hostPlatforms.includes(platform);
}

export const devicePlatforms: Platform[] = [Platform.PLATFORM_ANDROID, Platform.PLATFORM_IOS, Platform.PLATFORM_WINDOWS];

export function isDevicePlatform(platform: Platform): boolean {
  return devicePlatforms.includes(platform);
}
