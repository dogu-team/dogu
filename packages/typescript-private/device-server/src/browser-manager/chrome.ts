import { BrowserOrDriverName, BrowserVersion } from '@dogu-private/types';
import { DeepReadonly, PrefixLogger, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import { renameRetry } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import axios, { AxiosInstance } from 'axios';
import compressing from 'compressing';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { logger } from '../logger/logger.instance';
import { chromeVersionUtils } from './chrome-version-utils';
import { defaultDownloadRequestTimeout, defaultVersionRequestTimeout, download, validatePrefixOrPatternWithin } from './common';
import { WebCache } from './web-cache';

export type ChromeInstallableName = Extract<BrowserOrDriverName, 'chrome' | 'chromedriver'>;
export type ChromeChannelName = 'stable' | 'beta' | 'dev' | 'canary';
const defaultChromeChannelName = (): ChromeChannelName => 'stable';

export const ChromeInstallablePlatform = ['mac-arm64', 'mac-x64', 'win64', 'linux64'] as const;
export type ChromeInstallablePlatform = (typeof ChromeInstallablePlatform)[number];
export const isValidChromeInstallablePlatform = (value: string): value is ChromeInstallablePlatform => ChromeInstallablePlatform.includes(value as ChromeInstallablePlatform);

const downloadBaseUrl = 'https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing';
const executablePathMap: DeepReadonly<Record<ChromeInstallableName, Record<ChromeInstallablePlatform, string[]>>> = {
  chrome: {
    'mac-arm64': ['Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
    'mac-x64': ['Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
    win64: ['chrome.exe'],
    linux64: ['chrome'],
  },
  chromedriver: {
    'mac-arm64': ['chromedriver'],
    'mac-x64': ['chromedriver'],
    win64: ['chromedriver.exe'],
    linux64: ['chromedriver'],
  },
};

const chromePlatformMap: DeepReadonly<Record<Extract<NodeJS.Platform, 'darwin' | 'win32' | 'linux'>, Record<string, ChromeInstallablePlatform>>> = {
  darwin: {
    arm64: 'mac-arm64',
    x64: 'mac-x64',
  },
  win32: {
    x64: 'win64',
  },
  linux: {
    x64: 'linux64',
  },
};

const lastKnownGoodVersionsChannelMap: DeepReadonly<Record<ChromeChannelName, keyof LastKnownGoodVersions['channels']>> = {
  stable: 'Stable',
  beta: 'Beta',
  dev: 'Dev',
  canary: 'Canary',
};

export const chromeChannelNameMap = lastKnownGoodVersionsChannelMap;

export interface LastKnownGoodVersions {
  channels: {
    Stable: {
      version: BrowserVersion;
    };
    Beta: {
      version: BrowserVersion;
    };
    Dev: {
      version: BrowserVersion;
    };
    Canary: {
      version: BrowserVersion;
    };
  };
}

export interface KnownGoodVersions {
  versions: { version: BrowserVersion }[];
}

export interface GetLatestVersionOptions {
  channelName?: ChromeChannelName;
  timeout?: number;
}

function mergeGetLatestVersionOptions(options?: GetLatestVersionOptions): Required<GetLatestVersionOptions> {
  return {
    channelName: defaultChromeChannelName(),
    timeout: defaultVersionRequestTimeout(),
    ...options,
  };
}

export interface FindVersionOptions {
  prefix?: string | null;
  pattern?: RegExp | null;
  timeout?: number;
}

function mergeFindVersionOptions(options?: FindVersionOptions): Required<FindVersionOptions> {
  return {
    prefix: null,
    pattern: null,
    timeout: defaultVersionRequestTimeout(),
    ...options,
  };
}

export interface GetChromeInstallablePlatformOptions {
  platform?: NodeJS.Platform;
  arch?: NodeJS.Architecture;
}

function mergeGetChromeInstallablePlatformOptions(options?: GetChromeInstallablePlatformOptions): Required<GetChromeInstallablePlatformOptions> {
  return {
    platform: process.platform,
    arch: process.arch,
    ...options,
  };
}

export interface GetDownloadFileNameOptions {
  installableName: ChromeInstallableName;
  platform: ChromeInstallablePlatform;
}

export interface GetDownloadUrlOptions {
  version: BrowserVersion;
  platform: ChromeInstallablePlatform;
  downloadFileName: string;
}

export interface FindInstallationsOptions {
  installableName: ChromeInstallableName;
  platform: ChromeInstallablePlatform;
  rootPath: string;
}

export type FindInstallationsResult = {
  installableName: ChromeInstallableName;
  version: BrowserVersion;
  majorVersion: number;
  platform: ChromeInstallablePlatform;
  executablePath: string;
}[];

export interface GetInstallPathOptions {
  installableName: ChromeInstallableName;
  version: BrowserVersion;
  platform: ChromeInstallablePlatform;
  rootPath: string;
}

export interface GetExecutablePathOptions {
  installableName: ChromeInstallableName;
  platform: ChromeInstallablePlatform;
  installPath: string;
}

export interface InstallOptions {
  installableName: ChromeInstallableName;
  version: BrowserVersion;
  platform: ChromeInstallablePlatform;
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

export class Chrome {
  private readonly logger = new PrefixLogger(logger, `[${this.constructor.name}]`);
  private readonly client: AxiosInstance;
  private readonly lastKnownGoodVersionsCache: WebCache<LastKnownGoodVersions>;
  private readonly knownGoodVersionsCache: WebCache<KnownGoodVersions>;
  private readonly pathLock = new AsyncLock();

  constructor() {
    const client = axios.create();
    setAxiosErrorFilterToIntercepter(client);
    this.client = client;
    this.lastKnownGoodVersionsCache = new WebCache<LastKnownGoodVersions>({
      name: 'last-known-good-versions',
      url: 'https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json',
      client,
    });
    this.knownGoodVersionsCache = new WebCache<KnownGoodVersions>({
      name: 'known-good-versions',
      url: 'https://googlechromelabs.github.io/chrome-for-testing/known-good-versions.json',
      client,
    });
  }

  async getLatestVersion(options?: GetLatestVersionOptions): Promise<BrowserVersion> {
    const mergedOptions = mergeGetLatestVersionOptions(options);
    const { channelName, timeout } = mergedOptions;
    const lastKnownGoodVersions = await this.lastKnownGoodVersionsCache.get({
      timeout,
    });
    const lastKnownGoodVersionsChannel = lastKnownGoodVersionsChannelMap[channelName];
    const version = lastKnownGoodVersions.channels[lastKnownGoodVersionsChannel].version;
    return version;
  }

  async findVersion(options?: FindVersionOptions): Promise<BrowserVersion | undefined> {
    const mergedOptions = mergeFindVersionOptions(options);
    validatePrefixOrPatternWithin(mergedOptions);

    const { prefix, pattern, timeout } = mergedOptions;
    const knownGoodVersions = await this.knownGoodVersionsCache.get({
      timeout,
    });

    const versions = [...knownGoodVersions.versions.map(({ version }) => version)];
    versions.sort((lhs, rhs) => {
      const lhsVersion = chromeVersionUtils.parse(lhs);
      const rhsVersion = chromeVersionUtils.parse(rhs);
      return chromeVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
    });

    if (prefix) {
      const version = versions.find((version) => version.startsWith(prefix));
      return version;
    }

    if (pattern) {
      const version = versions.find((version) => pattern.test(version));
      return version;
    }

    throw new Error('Unexpected find version process');
  }

  async install(options: InstallOptions): Promise<InstallResult> {
    const mergedOptions = mergeInstallOptions(options);
    const { downloadTimeout } = mergedOptions;
    const installPath = this.getInstallPath(mergedOptions);
    return await this.pathLock.acquire(installPath, async () => {
      const executablePath = this.getExecutablePath({ ...mergedOptions, installPath });
      if (await fs.promises.stat(executablePath).catch(() => null)) {
        this.logger.info(`Already installed at ${installPath}`);
        return {
          executablePath,
        };
      }

      await fs.promises.mkdir(installPath, { recursive: true });
      const downloadFileName = this.getDownloadFileName(mergedOptions);
      const downloadUrl = this.getDownloadUrl({ ...mergedOptions, downloadFileName });

      const downloadFilePath = path.resolve(installPath, downloadFileName);
      try {
        await download({
          client: this.client,
          url: downloadUrl,
          filePath: downloadFilePath,
          timeout: downloadTimeout,
        });
        await compressing.zip.uncompress(downloadFilePath, installPath);
        const uncompressedPath = path.resolve(installPath, path.basename(downloadFileName, '.zip'));
        const downloadFiles = await fs.promises.readdir(uncompressedPath);
        await Promise.all(
          downloadFiles.map(async (downloadFile) => {
            const source = path.resolve(uncompressedPath, downloadFile);
            const dest = path.resolve(installPath, downloadFile);
            await renameRetry(source, dest, this.logger);
          }),
        );

        await fs.promises.rmdir(uncompressedPath);
        return {
          executablePath,
        };
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

  async findInstallations(options: FindInstallationsOptions): Promise<FindInstallationsResult> {
    const { installableName, rootPath, platform: requestedPlatform } = options;
    const installableNames = _.keys(executablePathMap) as ChromeInstallableName[];
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
              const parsed = chromeVersionUtils.parse(version);
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
          .filter(({ platform }) => isValidChromeInstallablePlatform(platform))
          .map(({ installableName, version, majorVersion, platform, versionPath }) => ({
            installableName,
            version,
            majorVersion,
            platform: platform as ChromeInstallablePlatform,
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
        const lhsVersion = chromeVersionUtils.parse(lhs.version);
        const rhsVersion = chromeVersionUtils.parse(rhs.version);
        return chromeVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
      });
    return withExecutablePathResults;
  }

  getDownloadFileName(options: GetDownloadFileNameOptions): string {
    const { installableName, platform } = options;
    const fileName = `${installableName}-${platform}.zip`;
    return fileName;
  }

  getDownloadUrl(options: GetDownloadUrlOptions): string {
    const { version, platform, downloadFileName } = options;
    const url = `${downloadBaseUrl}/${version}/${platform}/${downloadFileName}`;
    return url;
  }

  getChromeInstallablePlatform(options?: GetChromeInstallablePlatformOptions): ChromeInstallablePlatform {
    const mergedOptions = mergeGetChromeInstallablePlatformOptions(options);
    const { platform, arch } = mergedOptions;
    const chromePlatform = _.get(chromePlatformMap, [platform, arch]) as string | undefined;
    if (!chromePlatform) {
      throw new Error(`Unsupported platform: ${platform}, arch: ${arch}`);
    }
    if (!isValidChromeInstallablePlatform(chromePlatform)) {
      throw new Error(`Unsupported chrome platform: ${chromePlatform}`);
    }
    return chromePlatform;
  }

  getExecutablePath(options: GetExecutablePathOptions): string {
    const { installableName, platform, installPath } = options;
    const relativeExecutablePath = executablePathMap[installableName][platform];
    const executablePath = path.resolve(installPath, ...relativeExecutablePath);
    return executablePath;
  }

  getInstallPath(options: GetInstallPathOptions): string {
    const { installableName, version, rootPath, platform } = options;
    const installPath = path.resolve(rootPath, installableName, version, platform);
    return installPath;
  }
}
