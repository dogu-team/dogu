import { Platform } from '@dogu-tech/types';

export function nodeJsPlatformToPlatform(platform: NodeJS.Platform): Platform {
  switch (platform) {
    case 'linux':
      return Platform.PLATFORM_LINUX;
    case 'darwin':
      return Platform.PLATFORM_MACOS;
    case 'win32':
      return Platform.PLATFORM_WINDOWS;
    case 'android':
      return Platform.PLATFORM_ANDROID;
    default:
      return Platform.PLATFORM_UNSPECIFIED;
  }
}

export function processPlatform(): Platform {
  if (typeof process === 'undefined') {
    return Platform.PLATFORM_UNSPECIFIED;
  }

  const { platform } = process;
  if (platform == null) {
    return Platform.PLATFORM_UNSPECIFIED;
  }

  return nodeJsPlatformToPlatform(platform);
}
