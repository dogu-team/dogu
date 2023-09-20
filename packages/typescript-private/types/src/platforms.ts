import { Platform } from './protocol/generated/tsproto/outer/platform';

export const hostPlatforms: Platform[] = [Platform.PLATFORM_MACOS, Platform.PLATFORM_WINDOWS, Platform.PLATFORM_LINUX];

export function isHostPlatform(platform: Platform): boolean {
  return hostPlatforms.includes(platform);
}
