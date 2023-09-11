import { BrowserOrDriverName, BrowserVersion } from '@dogu-private/types';
import { DeepReadonly, PrefixLogger, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import { installPkg, renameRetry } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import axios, { AxiosInstance } from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { promisify } from 'util';
import { logger } from '../logger/logger.instance';
import { ChromeChannelName, chromeChannelNameMap } from './chrome';
import { chromeVersionUtils } from './chrome-version-utils';
import { defaultDownloadRequestTimeout, defaultInstallationTimeout, defaultVersionRequestTimeout, download, validatePrefixOrPatternWithin } from './common';

const execAsync = promisify(exec);

/**
 * @note etag is not supported
 */
const edgeUpdatesUrlForLatest = 'https://edgeupdates.microsoft.com/api/products';

/**
 * @note etag is not supported
 */
const edgeUpdatesUrlForFull = 'https://edgeupdates.microsoft.com/api/products?view=enterprise';

const windowsEdgeRootDirPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application';

export const edgeVersionUtils = chromeVersionUtils;
const edgeChannelNameMap = chromeChannelNameMap;

export type EdgeInstallableName = Extract<BrowserOrDriverName, 'edge'>;
export type EdgeChannelName = ChromeChannelName;
const defaultEdgeChannelName = (): EdgeChannelName => 'stable';

export const EdgeInstallablePlatform = ['MacOS', 'Windows'] as const;
export type EdgeInstallablePlatform = (typeof EdgeInstallablePlatform)[number];
const isValidEdgeInstallablePlatform = (platform: string): platform is EdgeInstallablePlatform => EdgeInstallablePlatform.includes(platform as EdgeInstallablePlatform);

export const EdgePlatform = [...EdgeInstallablePlatform, 'Android', 'iOS'] as const;
export type EdgePlatform = (typeof EdgePlatform)[number];
const isValidEdgePlatform = (platform: string): platform is EdgePlatform => EdgePlatform.includes(platform as EdgePlatform);

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
      x64: ['msedge.exe'],
      arm64: ['msedge.exe'],
    },
  },
};

const platformMap: DeepReadonly<Record<Extract<NodeJS.Platform, 'darwin' | 'win32'>, Record<string, EdgeInstallablePlatformArch>>> = {
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

const artifactNameMap: DeepReadonly<Record<EdgeInstallablePlatform, Record<string, string>>> = {
  MacOS: {
    universal: 'pkg',
  },
  Windows: {
    x64: 'msi',
    arm64: 'msi',
  },
};

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
  platform: EdgePlatform;
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
  installTimeout?: number;
}

function mergeInstallOptions(options: InstallOptions): Required<InstallOptions> {
  return {
    downloadTimeout: defaultDownloadRequestTimeout(),
    installTimeout: defaultInstallationTimeout(),
    ...options,
  };
}

export interface InstallResult {
  executablePath: string;
}

export type GetDownloadUrlOptions = FindVersionOptions;
const mergeGetDownloadUrlOptions = mergeFindVersionOptions;

export interface FindInstallationsOptions {
  installableName: EdgeInstallableName;
  platform: EdgeInstallablePlatform;
  arch: EdgeInstallableArch;
  rootPath: string;
}

export type FindInstallationsResult = {
  installableName: EdgeInstallableName;
  version: BrowserVersion;
  majorVersion: number;
  platform: EdgeInstallablePlatform;
  arch: EdgeInstallableArch;
  executablePath: string;
}[];

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
    const productName = edgeChannelNameMap[channelName];
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
    const productName = edgeChannelNameMap[channelName];
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
    const mergedOptions = mergeInstallOptions(options);
    const { version, downloadTimeout, installTimeout, platform } = mergedOptions;

    const installPath = this.getInstallPath(mergedOptions);
    return await this.pathLock.acquire(installPath, async () => {
      const executablePath =
        platform === 'Windows' //
          ? this.getExecutablePath({ ...mergedOptions, installPath: windowsEdgeRootDirPath })
          : this.getExecutablePath({ ...mergedOptions, installPath });
      if (await fs.promises.stat(executablePath).catch(() => null)) {
        this.logger.info(`Already installed: ${executablePath}`);
        return {
          executablePath,
        };
      }

      await fs.promises.mkdir(installPath, { recursive: true });
      const downloadUrl = await this.getDownloadUrl({ ...mergedOptions, prefix: version, timeout: downloadTimeout });
      const downloadFileName = path.basename(downloadUrl);
      const downloadFilePath = path.resolve(installPath, downloadFileName);
      try {
        await download({
          client: this.client,
          url: downloadUrl,
          filePath: downloadFilePath,
          timeout: downloadTimeout,
        });

        if (downloadFileName.toLowerCase().endsWith('.pkg')) {
          const installPkgResult = await installPkg(downloadFilePath, installTimeout);
          const { appPath } = installPkgResult;
          const appDirName = path.basename(appPath);
          const renamePath = path.resolve(installPath, appDirName);
          await renameRetry(appPath, renamePath, this.logger);
          return {
            executablePath,
          };
        } else if (downloadFileName.toLowerCase().endsWith('.msi')) {
          try {
            const { stdout } = await execAsync(`msiexec /i ${downloadFilePath} /quiet /qn /norestart`, {
              timeout: installTimeout,
              encoding: 'utf8',
            });
            this.logger.info(`msiexec stdout: ${stdout}`);
          } catch (error) {
            this.logger.warn(`Failed to install msiexec: ${stringify(error)}`);
          }
          return {
            executablePath,
          };
        } else {
          throw new Error(`Unexpected download file name: ${downloadFileName}`);
        }
      } catch (error) {
        throw new Error(`Failed to install from ${downloadUrl} to ${installPath}: ${stringify(error)}`);
      } finally {
        try {
          if (await fs.promises.stat(downloadFilePath).catch(() => null)) {
            await fs.promises.unlink(downloadFilePath);
          }
        } catch (error) {
          this.logger.warn(`Failed to delete ${downloadFilePath}: ${stringify(error)}`);
        }
      }
    });
  }

  async findInstallationsForWindows(options: FindInstallationsOptions): Promise<FindInstallationsResult> {
    const { installableName, platform: requestedPlatform, arch: requestedArch } = options;
    if (requestedPlatform !== 'Windows') {
      throw new Error(`Unexpected platform: ${requestedPlatform}`);
    }

    if (!(await fs.promises.stat(windowsEdgeRootDirPath).catch(() => null))) {
      return [];
    }

    const entries = await fs.promises.readdir(windowsEdgeRootDirPath);
    const versionDirs = entries.filter((entry) => {
      try {
        edgeVersionUtils.parse(entry);
        return true;
      } catch (error) {
        return false;
      }
    });
    const withVersionPaths = versionDirs.map((versionDir) => ({
      installableName,
      version: versionDir,
      majorVersion: edgeVersionUtils.parse(versionDir).major,
      versionPath: path.resolve(windowsEdgeRootDirPath, versionDir),
    }));
    const withVersionPathExists = await Promise.all(
      withVersionPaths.map(async ({ installableName, version, majorVersion, versionPath }) => ({
        installableName,
        version,
        majorVersion,
        versionPath,
        versionPathExist: await fs.promises
          .stat(versionPath)
          .then((stat) => stat.isDirectory())
          .catch(() => false),
      })),
    );
    const withExecutablePaths = withVersionPathExists
      .filter(({ versionPathExist }) => versionPathExist)
      .map(({ installableName, version, majorVersion, versionPath }) => ({
        installableName,
        version,
        majorVersion,
        platform: requestedPlatform,
        arch: requestedArch,
        executablePath: this.getExecutablePath({ installableName, platform: requestedPlatform, arch: requestedArch, installPath: versionPath }),
      }));
    const withExecutablePathExists = await Promise.all(
      withExecutablePaths.map(async ({ installableName, version, majorVersion, platform, arch, executablePath }) => ({
        installableName,
        version,
        majorVersion,
        platform,
        arch,
        executablePath,
        executablePathExist: await fs.promises
          .stat(executablePath)
          .then((stat) => stat.isFile())
          .catch(() => false),
      })),
    );
    const withExecutablePathResults = withExecutablePathExists
      .filter(({ executablePathExist }) => executablePathExist)
      .map(({ installableName, version, majorVersion, platform, arch, executablePath }) => ({
        installableName,
        version,
        majorVersion,
        platform,
        arch,
        executablePath,
      }))
      .sort((lhs, rhs) => {
        const lhsVersion = edgeVersionUtils.parse(lhs.version);
        const rhsVersion = edgeVersionUtils.parse(rhs.version);
        return edgeVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
      });
    return withExecutablePathResults;
  }

  async findInstallations(options: FindInstallationsOptions): Promise<FindInstallationsResult> {
    const { installableName, platform: requestedPlatform, arch: requestedArch, rootPath } = options;
    if (requestedPlatform === 'Windows') {
      return await this.findInstallationsForWindows(options);
    }

    const installableNames = _.keys(executablePathMap) as EdgeInstallableName[];
    const withInstallablePaths = installableNames
      .filter((name) => name === installableName)
      .map((installableName) => ({
        installableName,
        installablePath: path.resolve(rootPath, installableName),
      }));
    const withInstallablePathExists = await Promise.all(
      withInstallablePaths.map(async ({ installableName, installablePath }) => ({
        installableName,
        installablePath,
        installablePathExist: await fs.promises
          .stat(installablePath)
          .then((stat) => stat.isDirectory())
          .catch(() => false),
      })),
    );
    const withInstallablePathResults = withInstallablePathExists
      .filter(({ installablePathExist }) => installablePathExist)
      .map(({ installableName, installablePath }) => ({
        installableName,
        installablePath,
      }));
    const withVersionss = await Promise.all(
      withInstallablePathResults.map(async ({ installableName, installablePath }) => {
        const versions = await fs.promises.readdir(installablePath);
        return versions
          .map((version) => {
            try {
              const parsed = edgeVersionUtils.parse(version);
              return {
                installableName,
                version,
                majorVersion: parsed.major,
                installablePath,
              };
            } catch (error) {
              this.logger.warn(`Failed to parse version: ${version}: ${stringify(error)}`);
              return null;
            }
          })
          .filter((result): result is NonNullable<typeof result> => !!result);
      }),
    );
    const withVersions = withVersionss.flat();
    const withVersionPaths = withVersions.map(({ installableName, version, majorVersion, installablePath }) => ({
      installableName,
      version,
      majorVersion,
      versionPath: path.resolve(installablePath, version),
    }));
    const withVersionPathExists = await Promise.all(
      withVersionPaths.map(async ({ installableName, version, majorVersion, versionPath }) => ({
        installableName,
        version,
        majorVersion,
        versionPath,
        versionPathExist: await fs.promises
          .stat(path.resolve(versionPath, version))
          .then((stat) => stat.isDirectory())
          .catch(() => false),
      })),
    );
    const withVersionPathResults = withVersionPathExists
      .filter(({ versionPathExist }) => versionPathExist)
      .map(({ installableName, version, majorVersion, versionPath }) => ({
        installableName,
        version,
        majorVersion,
        versionPath,
      }));
    const withPlatformss = await Promise.all(
      withVersionPathResults.map(async ({ installableName, version, majorVersion, versionPath }) => {
        const platforms = await fs.promises.readdir(versionPath);
        return platforms
          .filter((platform) => platform === requestedPlatform)
          .map((platform) => ({
            installableName,
            version,
            majorVersion,
            platform,
            versionPath,
          }))
          .filter(({ platform }) => isValidEdgeInstallablePlatform(platform))
          .map(({ installableName, version, majorVersion, platform, versionPath }) => ({
            installableName,
            version,
            majorVersion,
            platform: platform as EdgeInstallablePlatform,
            versionPath,
          }));
      }),
    );
    const withPlatforms = withPlatformss.flat();
    const withPlatformPaths = withPlatforms.map(({ installableName, version, majorVersion, platform, versionPath }) => ({
      installableName,
      version,
      majorVersion,
      platform,
      platformPath: path.resolve(versionPath, platform),
    }));
    const withPlatformPathExists = await Promise.all(
      withPlatformPaths.map(async ({ installableName, version, majorVersion, platform, platformPath }) => ({
        installableName,
        version,
        majorVersion,
        platform,
        platformPath,
        platformPathExist: await fs.promises
          .stat(platformPath)
          .then((stat) => stat.isDirectory())
          .catch(() => false),
      })),
    );
    const withPlatformPathResults = withPlatformPathExists
      .filter(({ platformPathExist }) => platformPathExist)
      .map(({ installableName, version, majorVersion, platform, platformPath }) => ({
        installableName,
        version,
        majorVersion,
        platform,
        platformPath,
      }));
    const withArchss = await Promise.all(
      withPlatformPathResults.map(async ({ installableName, version, majorVersion, platform, platformPath }) => {
        const archs = await fs.promises.readdir(platformPath);
        return archs
          .filter((arch) => arch === requestedArch)
          .map((arch) => ({
            installableName,
            version,
            majorVersion,
            platform,
            arch,
            platformPath,
          }))
          .filter(({ arch }) => isValidEdgeInstallableArch(arch))
          .map(({ installableName, version, majorVersion, platform, arch }) => ({
            installableName,
            version,
            majorVersion,
            platform,
            arch: arch as EdgeInstallableArch,
            platformPath,
          }));
      }),
    );
    const withArchs = withArchss.flat();
    const withArchPaths = withArchs.map(({ installableName, version, majorVersion, platform, arch, platformPath }) => ({
      installableName,
      version,
      majorVersion,
      platform,
      arch,
      archPath: path.resolve(platformPath, arch),
    }));
    const withArchPathExists = await Promise.all(
      withArchPaths.map(async ({ installableName, version, majorVersion, platform, arch, archPath }) => ({
        installableName,
        version,
        majorVersion,
        platform,
        arch,
        archPath,
        archPathExist: await fs.promises
          .stat(archPath)
          .then((stat) => stat.isDirectory())
          .catch(() => false),
      })),
    );
    const withArchPathResults = withArchPathExists
      .filter(({ archPathExist }) => archPathExist)
      .map(({ installableName, version, majorVersion, platform, arch, archPath }) => ({
        installableName,
        version,
        majorVersion,
        platform,
        arch,
        archPath,
      }));
    const withExecutablePaths = withArchPathResults.map(({ installableName, version, majorVersion, platform, arch, archPath }) => ({
      installableName,
      version,
      majorVersion,
      platform,
      arch,
      executablePath: this.getExecutablePath({ installableName, platform, arch, installPath: archPath }),
    }));
    const withExecutablePathExists = await Promise.all(
      withExecutablePaths.map(async ({ installableName, version, majorVersion, platform, arch, executablePath }) => ({
        installableName,
        version,
        majorVersion,
        platform,
        arch,
        executablePath,
        executablePathExist: await fs.promises
          .stat(executablePath)
          .then((stat) => stat.isFile())
          .catch(() => false),
      })),
    );
    const withExecutablePathResults = withExecutablePathExists
      .filter(({ executablePathExist }) => executablePathExist)
      .map(({ installableName, version, majorVersion, platform, arch, executablePath }) => ({
        installableName,
        version,
        majorVersion,
        platform,
        arch,
        executablePath,
      }))
      .sort((lhs, rhs) => {
        const lhsVersion = edgeVersionUtils.parse(lhs.version);
        const rhsVersion = edgeVersionUtils.parse(rhs.version);
        return edgeVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
      });
    return withExecutablePathResults;
  }

  async getDownloadUrl(options: GetDownloadUrlOptions): Promise<string> {
    const mergedOptions = mergeGetDownloadUrlOptions(options);
    const release = await this.findEdgeUpdatesRelease(mergedOptions);
    if (!release) {
      throw new Error(`Cannot find release for options: ${stringify(mergedOptions)}`);
    }

    const platform = release.Platform;
    const arch = release.Architecture;
    const artifactName = _.get(artifactNameMap, [platform, arch]) as string | undefined;
    if (!artifactName) {
      throw new Error(`Cannot find artifact name for platform: ${platform}, arch: ${arch}`);
    }

    const artifact = release.Artifacts.find((artifact) => artifact.ArtifactName === artifactName);
    if (!artifact) {
      throw new Error(`Cannot find artifact for artifact name: ${artifactName}`);
    }

    const downloadUrl = artifact.Location;
    return downloadUrl;
  }

  getEdgeInstallablePlatformArch(options?: GetEdgeInstallablePlatformArchOptions): EdgeInstallablePlatformArch {
    const mergedOptions = mergeGetEdgeInstallablePlatformArchOptions(options);
    const { platform, arch } = mergedOptions;
    const edgePlatformArch = _.get(platformMap, [platform, arch]) as EdgeInstallablePlatformArch | undefined;
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
