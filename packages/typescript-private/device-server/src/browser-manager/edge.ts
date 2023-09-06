// latest
// https://edgeupdates.microsoft.com/api/products
// no etag

// full
// https://edgeupdates.microsoft.com/api/products?view=enterprise
// no etag

import { BrowserOrDriverName, BrowserVersion } from '@dogu-private/types';
import { DeepReadonly, PrefixLogger, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import AsyncLock from 'async-lock';
import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { logger } from '../logger/logger.instance';
import { ChromeChannelName, chromeChannelNameMap } from './chrome';
import { chromeVersionUtils } from './chrome-version-utils';
import { defaultDownloadRequestTimeout, defaultVersionRequestTimeout, validatePrefixOrPatternWithin } from './common';

const edgeUpdatesUrlForLatest = 'https://edgeupdates.microsoft.com/api/products';
const edgeUpdatesUrlForFull = 'https://edgeupdates.microsoft.com/api/products?view=enterprise';

export const edgeVersionUtils = chromeVersionUtils;

// https://msedgedriver.azureedge.net/LATEST_STABLE
// etag

// https://msedgedriver.azureedge.net/<version>/edgedriver_<edgedriverPlatform>.zip

export type EdgeInstallableName = Extract<BrowserOrDriverName, 'edge'>;
export type EdgeChannelName = ChromeChannelName;
const defaultEdgeChannelName = (): EdgeChannelName => 'stable';

export const EdgeInstallablePlatform = ['MacOS', 'Windows'] as const;
export type EdgeInstallablePlatform = (typeof EdgeInstallablePlatform)[number];
const isValidEdgeInstallablePlatform = (platform: string): platform is EdgeInstallablePlatform => EdgeInstallablePlatform.includes(platform as EdgeInstallablePlatform);

export const EdgeInstallableArch = ['universal', 'x64', 'arm64'] as const;
export type EdgeInstallableArch = (typeof EdgeInstallableArch)[number];
export const isValidEdgeInstallableArch = (arch: string): arch is EdgeInstallableArch => EdgeInstallableArch.includes(arch as EdgeInstallableArch);

export interface EdgeInstallablePlatformArch {
  platform: EdgeInstallablePlatform;
  arch: EdgeInstallableArch;
}

export function isValidEdgeInstallablePlatformArch(platformArch: unknown): platformArch is EdgeInstallablePlatformArch {
  const platform = _.get(platformArch, 'platform') as string | undefined;
  const arch = _.get(platformArch, 'arch') as string | undefined;
  return _.isString(platform) && isValidEdgeInstallablePlatform(platform) && _.isString(arch) && isValidEdgeInstallableArch(arch);
}

const executablePathMap: DeepReadonly<Record<EdgeInstallableName, Record<EdgeInstallablePlatform, Record<string, string[]>>>> = {
  edge: {
    MacOS: {
      universal: ['Microsoft Edge.app', 'Contents', 'MacOS', 'Microsoft Edge'],
    },
    Windows: {
      x64: ['msedgedriver.exe'],
      arm64: ['msedgedriver.exe'],
    },
  },
};

const edgePlatformMap: DeepReadonly<Record<Extract<NodeJS.Platform, 'darwin' | 'win32'>, Record<string, EdgeInstallablePlatformArch>>> = {
  darwin: {
    arm64: {
      platform: 'MacOS',
      arch: 'universal',
    },
    x64: {
      platform: 'MacOS',
      arch: 'universal',
    },
  },
  win32: {
    x64: {
      platform: 'Windows',
      arch: 'x64',
    },
    arm64: {
      platform: 'Windows',
      arch: 'arm64',
    },
  },
};

const edgeArtifactNameMap: DeepReadonly<Record<EdgeInstallablePlatform, Record<EdgeInstallableArch, string>>> = {};

export interface EdgeUpdatesArtifact {
  ArtifactName: string;
  Location: string;
}

export interface EdgeUpdatesRelease {
  Platform: string;
  Architecture: string;
  ProductVersion: string;
  Artifacts: EdgeUpdatesArtifact[];
}

export interface EdgeUpdatesProduct {
  Product: string;
  Releases: EdgeUpdatesRelease[];
}

export type EdgeUpdatesProducts = EdgeUpdatesProduct[];

export interface GetEdgeInstallablePlatformArchOptions {
  platform?: NodeJS.Platform;
  arch?: NodeJS.Architecture;
}

function mergeGetEdgeInstallablePlatformArchOptions(options?: GetEdgeInstallablePlatformArchOptions): Required<GetEdgeInstallablePlatformArchOptions> {
  return {
    platform: process.platform,
    arch: process.arch,
    ...options,
  };
}

export interface GetLatestVersionOptions {
  channelName?: EdgeChannelName;
  platform: EdgeInstallablePlatform;
  arch: EdgeInstallableArch;
  timeout?: number;
}

function mergeGetLatestVersionOptions(options: GetLatestVersionOptions): Required<GetLatestVersionOptions> {
  return {
    channelName: defaultEdgeChannelName(),
    timeout: defaultVersionRequestTimeout(),
    ...options,
  };
}

export interface FindVersionOptions {
  prefix?: string | null;
  pattern?: RegExp | null;
  channelName?: EdgeChannelName;
  platform: EdgeInstallablePlatform;
  arch: EdgeInstallableArch;
  timeout?: number;
}

function mergeFindVersionOptions(options: FindVersionOptions): Required<FindVersionOptions> {
  return {
    prefix: null,
    pattern: null,
    channelName: defaultEdgeChannelName(),
    timeout: defaultVersionRequestTimeout(),
    ...options,
  };
}

export type FindEdgeUpdatesReleaseOptions = FindVersionOptions;
const mergeFindEdgeUpdatesReleaseOptions = mergeFindVersionOptions;

export interface GetInstallPathOptions {
  installableName: EdgeInstallableName;
  version: BrowserVersion;
  platform: EdgeInstallablePlatform;
  arch: EdgeInstallableArch;
  rootPath: string;
}

export interface GetExecutablePathOptions {
  installableName: EdgeInstallableName;
  platform: EdgeInstallablePlatform;
  arch: EdgeInstallableArch;
  installPath: string;
}

export interface InstallOptions {
  installableName: EdgeInstallableName;
  version: BrowserVersion;
  platform: EdgeInstallablePlatform;
  arch: EdgeInstallableArch;
  rootPath: string;
  downloadTimeout?: number;
}

function mergeInstallOptions(options: InstallOptions): Required<InstallOptions> {
  return {
    downloadTimeout: defaultDownloadRequestTimeout(),
    ...options,
  };
}

export interface InstallResult {
  executablePath: string;
}

export type GetDownloadUrlOptions = FindVersionOptions;
const mergeGetDownloadUrlOptions = mergeFindVersionOptions;

export class Edge {
  private readonly logger = new PrefixLogger(logger, `[${this.constructor.name}]`);
  private readonly client: AxiosInstance;
  private readonly pathLock = new AsyncLock();

  constructor() {
    const client = axios.create();
    setAxiosErrorFilterToIntercepter(client);
    this.client = client;
  }

  async getLatestVersion(options: GetLatestVersionOptions): Promise<BrowserVersion> {
    const mergedOptions = mergeGetLatestVersionOptions(options);
    const { channelName, platform, arch, timeout } = mergedOptions;
    const { data } = await this.client.get<EdgeUpdatesProducts>(edgeUpdatesUrlForLatest, {
      timeout,
    });
    const productName = chromeChannelNameMap[channelName];
    const releases = data
      .filter((product) => product.Product === productName)
      .map((product) => product.Releases)
      .flat()
      .filter((release) => release.Platform === platform && release.Architecture === arch);

    if (releases.length === 0) {
      throw new Error(`Cannot find version for channel: ${channelName}, platform: ${platform}, arch: ${arch}`);
    }

    releases.sort((lhs, rhs) => {
      const lhsVersion = edgeVersionUtils.parse(lhs.ProductVersion);
      const rhsVersion = edgeVersionUtils.parse(rhs.ProductVersion);
      return edgeVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
    });

    const latestRelease = releases[0];
    return latestRelease.ProductVersion;
  }

  private async findEdgeUpdatesRelease(options: FindEdgeUpdatesReleaseOptions): Promise<EdgeUpdatesRelease | undefined> {
    const mergedOptions = mergeFindEdgeUpdatesReleaseOptions(options);
    validatePrefixOrPatternWithin(mergedOptions);

    const { prefix, channelName, pattern, platform, arch, timeout } = mergedOptions;
    const { data } = await this.client.get<EdgeUpdatesProducts>(edgeUpdatesUrlForFull, {
      timeout,
    });
    const productName = chromeChannelNameMap[channelName];
    const releases = data
      .filter((product) => product.Product === productName)
      .map((product) => product.Releases)
      .flat()
      .filter((release) => release.Platform === platform && release.Architecture === arch);

    if (releases.length === 0) {
      throw new Error(`Cannot find version for channel: ${channelName}, platform: ${platform}, arch: ${arch}`);
    }

    releases.sort((lhs, rhs) => {
      const lhsVersion = edgeVersionUtils.parse(lhs.ProductVersion);
      const rhsVersion = edgeVersionUtils.parse(rhs.ProductVersion);
      return edgeVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
    });

    if (prefix) {
      const release = releases.find((release) => release.ProductVersion.startsWith(prefix));
      return release;
    }

    if (pattern) {
      const release = releases.find((release) => pattern.test(release.ProductVersion));
      return release;
    }

    throw new Error('Unexpected find release process');
  }

  async findVersion(options: FindVersionOptions): Promise<BrowserVersion | undefined> {
    const mergedOptions = mergeFindVersionOptions(options);
    validatePrefixOrPatternWithin(mergedOptions);
    const release = await this.findEdgeUpdatesRelease(mergedOptions);
    return release?.ProductVersion;
  }

  async install(options: InstallOptions): Promise<InstallResult> {
    //   // installer -pkg Edge.pkg -target CurrentUserHomeDirectory
    const mergedOptions = mergeInstallOptions(options);
    const { installableName, version, platform, arch, rootPath, downloadTimeout } = mergedOptions;
    const installPath = this.getInstallPath(mergedOptions);
    return await this.pathLock.acquire(installPath, async () => {
      const executablePath = this.getExecutablePath({ ...mergedOptions, installPath });
      if (await fs.promises.stat(executablePath).catch(() => null)) {
        this.logger.info(`Already installed: ${executablePath}`);
        return {
          executablePath,
        };
      }

      await fs.promises.mkdir(installPath, { recursive: true });
      const downloadUrl = await this.getDownloadUrl(mergedOptions);
    });
  }

  async getDownloadUrl(options: GetDownloadUrlOptions): Promise<string> {
    const mergedOptions = mergeGetDownloadUrlOptions(options);
    const release = await this.findEdgeUpdatesRelease(mergedOptions);
    if (!release) {
      throw new Error(`Cannot find release for options: ${stringify(mergedOptions)}`);
    }

    const artifact = release.Artifacts.find((artifact) => artifact.ArtifactName === 'edgedriver');
  }

  getEdgeInstallablePlatformArchOptions(options?: GetEdgeInstallablePlatformArchOptions): Required<EdgeInstallablePlatformArch> {
    const mergedOptions = mergeGetEdgeInstallablePlatformArchOptions(options);
    const { platform, arch } = mergedOptions;
    const edgePlatformArch = _.get(edgePlatformMap, [platform, arch]) as EdgeInstallablePlatformArch | undefined;
    if (!edgePlatformArch) {
      throw new Error(`Cannot find for platform: ${platform}, arch: ${arch}`);
    }

    if (!isValidEdgeInstallablePlatformArch(edgePlatformArch)) {
      throw new Error(`Invalid edge platform: ${stringify(edgePlatformArch)}`);
    }

    return edgePlatformArch;
  }

  getExecutablePath(options: GetExecutablePathOptions): string {
    const { installableName, platform, arch, installPath } = options;
    const relativeExecutablePath = executablePathMap[installableName][platform][arch];
    const executablePath = path.resolve(installPath, ...relativeExecutablePath);
    return executablePath;
  }

  getInstallPath(options: GetInstallPathOptions): string {
    const { installableName, version, platform, arch, rootPath } = options;
    const installPath = path.resolve(rootPath, installableName, version, platform, arch);
    return installPath;
  }
}
