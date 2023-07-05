import { PlatformType } from '@dogu-tech/types';

export function convertWebDriverPlatformToDogu(platform: string): PlatformType {
  const lower = platform.toLowerCase();
  switch (lower) {
    case 'android':
      return 'android';
    case 'ios':
      return 'ios';
    case 'windows':
      return 'windows';
    case 'mac':
      return 'macos';
    default:
      throw new Error(`Invalid platform: ${platform}`);
  }
}
