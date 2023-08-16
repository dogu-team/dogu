import { Architecture, Platform } from '@dogu-tech/types';

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

export function processArchitecture(): Architecture {
  if (typeof process === 'undefined') {
    return Architecture.ARCHITECTURE_UNSPECIFIED;
  }

  const { arch } = process;
  if (arch == null) {
    return Architecture.ARCHITECTURE_UNSPECIFIED;
  }

  switch (arch) {
    case 'x64':
      return Architecture.ARCHITECTURE_X64;
    case 'arm':
      return Architecture.ARCHITECTURE_ARM;
    case 'arm64':
      return Architecture.ARCHITECTURE_ARM64;
    default:
      return Architecture.ARCHITECTURE_UNSPECIFIED;
  }
}
