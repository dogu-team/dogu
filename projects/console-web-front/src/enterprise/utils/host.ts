import { HostBase } from '@dogu-private/console';
import { Architecture, DownloadablePackageResult, DOWNLOAD_PLATFORMS, Platform } from '@dogu-private/types';

import { parseSemver } from '../../utils/download';

export const getAgentUpdatableInfo = (
  latestInfo: DownloadablePackageResult[],
  host: HostBase,
): { isLatest: boolean; isUpdatable: boolean; reason?: string } => {
  if (!host.agentVersion) {
    return {
      isLatest: false,
      isUpdatable: false,
      reason: 'Unknown agent version',
    };
  }

  let info: DownloadablePackageResult | undefined;
  const agentVersion = parseSemver(host.agentVersion);

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

  if (info?.version === host.agentVersion) {
    return {
      isLatest: true,
      isUpdatable: false,
    };
  }

  if (agentVersion.major === 1 && agentVersion.minor < 8) {
    return {
      isLatest: false,
      isUpdatable: false,
      reason: 'Available over agent version 1.8.0',
    };
  }

  if (info && info.version !== host.agentVersion) {
    return {
      isLatest: false,
      isUpdatable: true,
    };
  }

  return {
    isLatest: false,
    isUpdatable: false,
    reason: 'Latest agent not found',
  };
};
