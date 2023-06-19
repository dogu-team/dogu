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
