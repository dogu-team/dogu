import { BrowserOrDriverName, BrowserVersion } from '@dogu-private/types';
import { DeepReadonly, PrefixLogger, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import { download } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import axios, { AxiosInstance } from 'axios';
import compressing from 'compressing';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { logger } from '../logger/logger.instance';
import { defaultVersionRequestTimeout, validatePrefixOrPatternWithin } from './common';
import { edgeVersionUtils } from './edge';
import { WebCache } from './web-cache';

export type EdgedriverInstallableName = Extract<BrowserOrDriverName, 'msedgedriver'>;

export const EdgedriverInstallablePlatform = ['win64', 'mac64', 'mac64_m1', 'linux64'] as const;
export type EdgedriverInstallablePlatform = (typeof EdgedriverInstallablePlatform)[number];
const isValidEdgedriverInstallablePlatform = (platform: string): platform is EdgedriverInstallablePlatform =>
  EdgedriverInstallablePlatform.includes(platform as EdgedriverInstallablePlatform);

const executablePathMap: DeepReadonly<Record<EdgedriverInstallableName, Record<EdgedriverInstallablePlatform, string>>> = {
  msedgedriver: {
    mac64: 'msedgedriver',
    mac64_m1: 'msedgedriver',
    win64: 'msedgedriver.exe',
    linux64: 'msedgedriver',
  },
};

const platformMap: DeepReadonly<Record<Extract<NodeJS.Platform, 'darwin' | 'win32' | 'linux'>, Record<string, EdgedriverInstallablePlatform>>> = {
  darwin: {
    x64: 'mac64',
    arm64: 'mac64_m1',
  },
  win32: {
    x64: 'win64',
  },
  linux: {
    x64: 'linux64',
  },
};

/**
 * @note download content encoding: utf16le
 */
const latestVersionPattern = /(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<build>\d+))?(?:\.(?<patch>\d+))?/;

/**
 * @description list blobs api https://learn.microsoft.com/en-us/rest/api/storageservices/list-blobs?tabs=azure-ad
 */
const blobUrl = 'https://msedgewebdriverstorage.blob.core.windows.net/edgewebdriver/?restype=container&comp=list';

/**
 * @example
 * 100.0.1154.0/edgedriver_arm64.zip
 */
const blobUrlPattern = /(?<major>\d+)\.(?<minor>\d+)\.(?<build>\d+)\.(?<patch>\d+)\/edgedriver_(?<platform>\w+)\.zip/;

interface Blob {
  Name: string;
  Url: string;
}

interface BlobResult {
  EnumerationResults: {
    Blobs: {
      Blob: Blob | Blob[];
    };
    NextMarker: string;
  };
}

export interface GetLatestVersionOptions {
  timeout?: number;
}

function mergeGetLatestVersionOptions(options?: GetLatestVersionOptions): Required<GetLatestVersionOptions> {
  return {
    timeout: defaultVersionRequestTimeout(),
    ...options,
  };
}

export interface FindVersionOptions {
  prefix?: string | null;
  pattern?: RegExp | null;
  platform: EdgedriverInstallablePlatform;
  timeout?: number;
}

function mergeFindVersionOptions(options: FindVersionOptions): Required<FindVersionOptions> {
  return {
    prefix: null,
    pattern: null,
    timeout: defaultVersionRequestTimeout(),
    ...options,
  };
}

export interface FindVersionResult {
  version: BrowserVersion;
  url: string;
}

interface VersionUrl {
  platform: EdgedriverInstallablePlatform;
  version: BrowserVersion;
  url: string;
}

export interface GetExecutablePathOptions {
  installableName: EdgedriverInstallableName;
  platform: EdgedriverInstallablePlatform;
  installPath: string;
}

export interface InstallOptions {
  installableName: EdgedriverInstallableName;
  version: BrowserVersion;
  platform: EdgedriverInstallablePlatform;
  rootPath: string;
  versionRequestTimeout?: number;
  downloadTimeout?: number;
}

function mergeInstallOptions(options: InstallOptions): Required<InstallOptions> {
  return {
    versionRequestTimeout: defaultVersionRequestTimeout(),
    downloadTimeout: defaultVersionRequestTimeout(),
    ...options,
  };
}

export interface InstallResult {
  executablePath: string;
}

export interface GetInstallPathOptions {
  installableName: EdgedriverInstallableName;
  version: BrowserVersion;
  platform: EdgedriverInstallablePlatform;
  rootPath: string;
}

export interface FindInstallationsOptions {
  installableName: EdgedriverInstallableName;
  platform: EdgedriverInstallablePlatform;
  rootPath: string;
}

export type FindInstallationsResult = {
  installableName: EdgedriverInstallableName;
  version: BrowserVersion;
  majorVersion: number;
  platform: EdgedriverInstallablePlatform;
  executablePath: string;
}[];

export interface GetEdgedriverInstallablePlatformOptions {
  platform?: NodeJS.Platform;
  arch?: NodeJS.Architecture;
}

function mergeGetEdgedriverInstallablePlatformOptions(options?: GetEdgedriverInstallablePlatformOptions): Required<GetEdgedriverInstallablePlatformOptions> {
  return {
    platform: process.platform,
    arch: process.arch,
    ...options,
  };
}

export class Edgedriver {
  private readonly logger = new PrefixLogger(logger, `[${this.constructor.name}]`);
  private readonly client: AxiosInstance;
  private readonly pathLock = new AsyncLock();
  private readonly latestVersionCache: WebCache<Buffer>;
  private versionUrlsCache: VersionUrl[] = [];
  private latestVersionForVersionUrlsCache: string | undefined;

  constructor() {
    const client = axios.create();
    setAxiosErrorFilterToIntercepter(client);
    this.client = client;
    this.latestVersionCache = new WebCache<Buffer>({
      name: 'edgedriver-latest-version',
      url: 'https://msedgedriver.azureedge.net/LATEST_STABLE',
      client,
    });
  }

  async getLatestVersion(options?: GetLatestVersionOptions): Promise<BrowserVersion> {
    const mergedOptions = mergeGetLatestVersionOptions(options);
    const { timeout } = mergedOptions;
    const versionPatternRaw = await this.latestVersionCache.get({
      timeout,
    });
    const versionPattern = Buffer.from(versionPatternRaw).toString('utf16le');
    const match = versionPattern.match(latestVersionPattern);
    if (!match) {
      throw new Error(`Invalid version pattern: ${versionPattern}`);
    }

    const { major, minor, build, patch } = match.groups as Record<string, string | undefined>;
    if (major === undefined) {
      throw new Error(`Invalid version pattern: ${versionPattern}`);
    }

    const version = edgeVersionUtils.toString({
      major: Number(major),
      minor: minor !== undefined ? Number(minor) : undefined,
      build: build !== undefined ? Number(build) : undefined,
      patch: patch !== undefined ? Number(patch) : undefined,
    });
    return version;
  }

  async findVersion(options: FindVersionOptions): Promise<FindVersionResult | undefined> {
    const mergedOptions = mergeFindVersionOptions(options);
    validatePrefixOrPatternWithin(mergedOptions);

    const { prefix, pattern, platform: requestedPlatform, timeout } = mergedOptions;
    const latestVersionForVersionUrlsCache = await this.getLatestVersion({
      timeout,
    });

    if (latestVersionForVersionUrlsCache === this.latestVersionForVersionUrlsCache) {
      const versionUrl = this.versionUrlsCache
        .filter(({ platform }) => platform === requestedPlatform)
        .find(({ version }) => {
          if (prefix) {
            return version.startsWith(prefix);
          }

          if (pattern) {
            return pattern.test(version);
          }

          throw new Error('Unexpected filter condition');
        });

      return versionUrl;
    }

    const parser = new XMLParser();
    const nameUrls: { name: string; url: string }[] = [];
    let marker = '';
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const url = marker ? `${blobUrl}&marker=${marker}` : blobUrl;
      const response = await this.client.get(url, {
        timeout,
      });

      const data = response.data as string;
      const blobResult = parser.parse(data) as BlobResult;
      const { Blob } = blobResult.EnumerationResults.Blobs;
      if (Array.isArray(Blob)) {
        nameUrls.push(...Blob.map(({ Name, Url }) => ({ name: Name, url: Url })));
      } else {
        nameUrls.push({ name: Blob.Name, url: Blob.Url });
      }

      if (!blobResult.EnumerationResults.NextMarker) {
        break;
      }

      marker = blobResult.EnumerationResults.NextMarker;
    }

    const versionUrls = nameUrls
      .map(({ name, url }) => {
        const match = name.match(blobUrlPattern);
        if (!match) {
          return null;
        }

        const { major, minor, build, patch, platform } = match.groups as Record<string, string | undefined>;
        if (major === undefined || platform === undefined) {
          return null;
        }

        const version = edgeVersionUtils.toString({
          major: Number(major),
          minor: minor !== undefined ? Number(minor) : undefined,
          build: build !== undefined ? Number(build) : undefined,
          patch: patch !== undefined ? Number(patch) : undefined,
        });

        return {
          version,
          platform,
          url,
        };
      })
      .filter((match): match is { version: BrowserVersion; platform: EdgedriverInstallablePlatform; url: string } => !!match)
      .filter(({ platform }) => platform === requestedPlatform)
      .sort(({ version: lhs }, { version: rhs }) => {
        const lhsVersion = edgeVersionUtils.parse(lhs);
        const rhsVersion = edgeVersionUtils.parse(rhs);
        return edgeVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
      });

    if (versionUrls.length === 0) {
      return undefined;
    }

    this.versionUrlsCache = versionUrls;
    this.latestVersionForVersionUrlsCache = latestVersionForVersionUrlsCache;

    const versionUrl = versionUrls
      .filter(({ platform }) => platform === requestedPlatform)
      .find(({ version }) => {
        if (prefix) {
          return version.startsWith(prefix);
        }

        if (pattern) {
          return pattern.test(version);
        }

        throw new Error('Unexpected filter condition');
      });

    return versionUrl;
  }

  async install(options: InstallOptions): Promise<InstallResult> {
    const mergedOptions = mergeInstallOptions(options);
    const { version, platform, versionRequestTimeout, downloadTimeout } = mergedOptions;
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
      const foundVersion = await this.findVersion({
        prefix: version,
        platform,
        timeout: versionRequestTimeout,
      });
      if (!foundVersion) {
        throw new Error(`Could not find version: ${mergedOptions.version}`);
      }

      const { url } = foundVersion;
      const downloadFileName = path.basename(url);
      const downloadFilePath = path.resolve(installPath, downloadFileName);
      try {
        await download({
          client: this.client,
          url,
          filePath: downloadFilePath,
          timeout: downloadTimeout,
        });

        await compressing.zip.uncompress(downloadFilePath, installPath);
        return {
          executablePath,
        };
      } catch (error) {
        throw new Error(`Failed to install from ${url} to ${installPath}: ${stringify(error)}`);
      } finally {
        try {
          if (await fs.promises.stat(downloadFilePath).catch(() => null)) {
            await fs.promises.unlink(downloadFilePath);
          }
        } catch (error) {
          this.logger.warn(`Failed to delete ${url}: ${stringify(error)}`);
        }
      }
    });
  }

  async findInstallations(options: FindInstallationsOptions): Promise<FindInstallationsResult> {
    const { installableName, platform: requestedPlatform, rootPath } = options;
    const installableNames = _.keys(executablePathMap) as EdgedriverInstallableName[];
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
      installablePath,
      versionPath: path.resolve(installablePath, version),
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
          .filter(({ platform }) => isValidEdgedriverInstallablePlatform(platform))
          .map(({ installableName, version, majorVersion, platform, versionPath }) => ({
            installableName,
            version,
            majorVersion,
            platform: platform as EdgedriverInstallablePlatform,
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
    const withExecutablePaths = withPlatformPathResults.map(({ installableName, version, majorVersion, platform, platformPath }) => ({
      installableName,
      version,
      majorVersion,
      platform,
      executablePath: this.getExecutablePath({
        installableName,
        platform,
        installPath: platformPath,
      }),
    }));
    const withExecutablePathExists = await Promise.all(
      withExecutablePaths.map(async ({ installableName, version, majorVersion, platform, executablePath }) => ({
        installableName,
        version,
        majorVersion,
        platform,
        executablePath,
        executablePathExist: await fs.promises
          .stat(executablePath)
          .then((stat) => stat.isFile())
          .catch(() => false),
      })),
    );
    const withExecutablePathResults = withExecutablePathExists
      .filter(({ executablePathExist }) => executablePathExist)
      .map(({ installableName, version, majorVersion, platform, executablePath }) => ({
        installableName,
        version,
        majorVersion,
        platform,
        executablePath,
      }))
      .sort((lhs, rhs) => {
        const lhsVersion = edgeVersionUtils.parse(lhs.version);
        const rhsVersion = edgeVersionUtils.parse(rhs.version);
        return edgeVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
      });
    return withExecutablePathResults;
  }

  getEdgedriverInstallablePlatform(options?: GetEdgedriverInstallablePlatformOptions): EdgedriverInstallablePlatform {
    const mergedOptions = mergeGetEdgedriverInstallablePlatformOptions(options);
    const { platform, arch } = mergedOptions;
    const edgedriverPlatform = _.get(platformMap, [platform, arch]) as EdgedriverInstallablePlatform | undefined;
    if (!edgedriverPlatform) {
      throw new Error(`Cannot find for platform: ${platform}, arch: ${arch}`);
    }

    if (!isValidEdgedriverInstallablePlatform(edgedriverPlatform)) {
      throw new Error(`Invalid edgedriver platform: ${stringify(edgedriverPlatform)}`);
    }

    return edgedriverPlatform;
  }

  getExecutablePath(options: GetExecutablePathOptions): string {
    const { installableName, platform, installPath } = options;
    const relativeExecutablePath = executablePathMap[installableName][platform];
    const executablePath = path.resolve(installPath, relativeExecutablePath);
    return executablePath;
  }

  getInstallPath(options: GetInstallPathOptions): string {
    const { installableName, version, platform, rootPath } = options;
    const installPath = path.resolve(rootPath, installableName, version, platform);
    return installPath;
  }
}
