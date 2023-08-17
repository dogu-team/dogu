import { Architecture, Platform } from '@dogu-private/types';

export enum DOWNLOAD_PLATFORMS {
  UNDEFINED = '',
  WINDOWS = 'windows',
  APPLE_X86 = 'apple_x86',
  APPLE_ARM64 = 'apple_arm64',
}

export interface DownloadablePackageResult {
  platform: DOWNLOAD_PLATFORMS;
  name: string;
  url: string;
  releasedAt: string;
  version: string;
  size: number;
}

export function platformArchitectureFromDownloadablePackageResult(result: DownloadablePackageResult): { platform: Platform; architecture: Architecture } {
  switch (result.platform) {
    case DOWNLOAD_PLATFORMS.APPLE_ARM64:
      return { platform: Platform.PLATFORM_MACOS, architecture: Architecture.ARCHITECTURE_ARM64 };
    case DOWNLOAD_PLATFORMS.APPLE_X86:
      return { platform: Platform.PLATFORM_MACOS, architecture: Architecture.ARCHITECTURE_X64 };
    case DOWNLOAD_PLATFORMS.WINDOWS:
      return { platform: Platform.PLATFORM_WINDOWS, architecture: Architecture.ARCHITECTURE_X64 };
    default:
      throw new Error(`Unknown platform: ${result.platform}`);
  }
}

export function downloadPlatformsFromFilename(filename: string): DOWNLOAD_PLATFORMS {
  let platform = DOWNLOAD_PLATFORMS.UNDEFINED;
  if (filename.includes('mac-arm64')) {
    platform = DOWNLOAD_PLATFORMS.APPLE_ARM64;
  } else if (filename.includes('mac-x64')) {
    platform = DOWNLOAD_PLATFORMS.APPLE_X86;
  } else if (filename.includes('win-x64')) {
    platform = DOWNLOAD_PLATFORMS.WINDOWS;
  }
  return platform;
}
