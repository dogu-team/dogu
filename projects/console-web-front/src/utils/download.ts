import { HostBase } from '@dogu-private/console';
import { Architecture, DownloadablePackageResult, DOWNLOAD_PLATFORMS, Platform } from '@dogu-private/types';

export const isAgentUpdatable = (latestInfo: DownloadablePackageResult[], host: HostBase): boolean => {
  let info: DownloadablePackageResult | undefined;

  switch (host.platform) {
    case Platform.PLATFORM_MACOS:
      if (host.architecture === Architecture.ARCHITECTURE_ARM64) {
        info = latestInfo.find((info) => info.platform === DOWNLOAD_PLATFORMS.APPLE_ARM64);
      } else {
        info = latestInfo.find((info) => info.platform === DOWNLOAD_PLATFORMS.APPLE_X86);
      }
      break;
    case Platform.PLATFORM_WINDOWS:
      info = latestInfo.find((info) => info.platform === DOWNLOAD_PLATFORMS.WINDOWS);
      break;
  }

  if (info && info.version !== host.agentVersion) {
    return true;
  }

  return false;
};
