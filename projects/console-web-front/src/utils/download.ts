import { HostBase } from '@dogu-private/console';
import { Architecture, DownloadablePackageResult, DOWNLOAD_PLATFORMS, Platform } from '@dogu-private/types';

export const getAgentUpdatableInfo = (latestInfo: DownloadablePackageResult[], host: HostBase): { isLatest: boolean; isUpdatable: boolean; reason?: string } => {
  if (!host.agentVersion) {
    return {
      isLatest: false,
      isUpdatable: false,
      reason: 'Unknown agent version',
    };
  }

  let info: DownloadablePackageResult | undefined;
  const agentVersion = parseSemver(host.agentVersion);

  if (agentVersion.major === 1 && agentVersion.minor < 8) {
    return {
      isLatest: false,
      isUpdatable: false,
      reason: 'Available over v1.8.0',
    };
  }

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
    return {
      isLatest: false,
      isUpdatable: true,
    };
  }

  if (info?.version === host.agentVersion) {
    return {
      isLatest: true,
      isUpdatable: false,
    };
  }

  return {
    isLatest: false,
    isUpdatable: false,
    reason: 'Latest agent not found',
  };
};

/*
 * Parse semver-like string to major, minor, patch and rc(optional)
 * ex1. 1.4.0 => { major: 1, minor: 4, patch: 0, rc: undefined }
 * ex2. 1.11.0-rc.2 => { major: 1, minor: 11, patch: 0, rc: 2 }
 */
export const parseSemver = (version: string): { major: number; minor: number; patch: number; rc: number | undefined } => {
  const [versionStr, rcStr] = version.split('-rc.');
  const [major, minor, patch] = versionStr.split('.').map(Number);
  const rc = rcStr ? Number(rcStr) : undefined;

  return { major, minor, patch, rc };
};
