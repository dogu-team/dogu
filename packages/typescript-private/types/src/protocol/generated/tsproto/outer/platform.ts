/* eslint-disable */

export enum Platform {
  PLATFORM_UNSPECIFIED = 0,
  PLATFORM_LINUX = 1,
  PLATFORM_MACOS = 10,
  PLATFORM_WINDOWS = 20,
  PLATFORM_ANDROID = 30,
  PLATFORM_IOS = 40,
  PLATFORM_PS4 = 50,
  PLATFORM_XBOX = 60,
  UNRECOGNIZED = -1,
}

export function platformFromJSON(object: any): Platform {
  switch (object) {
    case 0:
    case 'PLATFORM_UNSPECIFIED':
      return Platform.PLATFORM_UNSPECIFIED;
    case 1:
    case 'PLATFORM_LINUX':
      return Platform.PLATFORM_LINUX;
    case 10:
    case 'PLATFORM_MACOS':
      return Platform.PLATFORM_MACOS;
    case 20:
    case 'PLATFORM_WINDOWS':
      return Platform.PLATFORM_WINDOWS;
    case 30:
    case 'PLATFORM_ANDROID':
      return Platform.PLATFORM_ANDROID;
    case 40:
    case 'PLATFORM_IOS':
      return Platform.PLATFORM_IOS;
    case 50:
    case 'PLATFORM_PS4':
      return Platform.PLATFORM_PS4;
    case 60:
    case 'PLATFORM_XBOX':
      return Platform.PLATFORM_XBOX;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return Platform.UNRECOGNIZED;
  }
}

export function platformToJSON(object: Platform): string {
  switch (object) {
    case Platform.PLATFORM_UNSPECIFIED:
      return 'PLATFORM_UNSPECIFIED';
    case Platform.PLATFORM_LINUX:
      return 'PLATFORM_LINUX';
    case Platform.PLATFORM_MACOS:
      return 'PLATFORM_MACOS';
    case Platform.PLATFORM_WINDOWS:
      return 'PLATFORM_WINDOWS';
    case Platform.PLATFORM_ANDROID:
      return 'PLATFORM_ANDROID';
    case Platform.PLATFORM_IOS:
      return 'PLATFORM_IOS';
    case Platform.PLATFORM_PS4:
      return 'PLATFORM_PS4';
    case Platform.PLATFORM_XBOX:
      return 'PLATFORM_XBOX';
    case Platform.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

export enum Architecture {
  ARCHITECTURE_UNSPECIFIED = 0,
  ARCHITECTURE_X86 = 10,
  ARCHITECTURE_X64 = 20,
  ARCHITECTURE_ARM = 30,
  ARCHITECTURE_ARM64 = 40,
  UNRECOGNIZED = -1,
}

export function architectureFromJSON(object: any): Architecture {
  switch (object) {
    case 0:
    case 'ARCHITECTURE_UNSPECIFIED':
      return Architecture.ARCHITECTURE_UNSPECIFIED;
    case 10:
    case 'ARCHITECTURE_X86':
      return Architecture.ARCHITECTURE_X86;
    case 20:
    case 'ARCHITECTURE_X64':
      return Architecture.ARCHITECTURE_X64;
    case 30:
    case 'ARCHITECTURE_ARM':
      return Architecture.ARCHITECTURE_ARM;
    case 40:
    case 'ARCHITECTURE_ARM64':
      return Architecture.ARCHITECTURE_ARM64;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return Architecture.UNRECOGNIZED;
  }
}

export function architectureToJSON(object: Architecture): string {
  switch (object) {
    case Architecture.ARCHITECTURE_UNSPECIFIED:
      return 'ARCHITECTURE_UNSPECIFIED';
    case Architecture.ARCHITECTURE_X86:
      return 'ARCHITECTURE_X86';
    case Architecture.ARCHITECTURE_X64:
      return 'ARCHITECTURE_X64';
    case Architecture.ARCHITECTURE_ARM:
      return 'ARCHITECTURE_ARM';
    case Architecture.ARCHITECTURE_ARM64:
      return 'ARCHITECTURE_ARM64';
    case Architecture.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
