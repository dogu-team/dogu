import { BrowserOrDriverName, BrowserVersion } from '@dogu-private/types';
import { DeepReadonly, notEmpty, PrefixLogger, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import { renameRetry } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import axios, { AxiosInstance } from 'axios';
import compressing from 'compressing';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { logger } from '../logger/logger.instance';
import { chromeVersionUtils } from './chrome-version-utils';
import { defaultVersionRequestTimeout, download, validatePrefixOrPatternWithin } from './common';
import { WebCache } from './web-cache';

const downloadBaseUrl = 'https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing';
const executablePathMap: DeepReadonly<Record<ChromeInstallableName, Record<ChromePlatform, string[]>>> = {
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
const chromePlatformMap: DeepReadonly<Record<Extract<NodeJS.Platform, 'darwin' | 'win32' | 'linux'>, Record<string, ChromePlatform>>> = {
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

export interface LastKnownGoodVersions {
  channels: {
    Stable: {
      version: string;
    };
    Beta: {
      version: string;
    };
    Dev: {
      version: string;
    };
    Canary: {
      version: string;
    };
  };
}

export interface KnownGoodVersions {
  versions: { version: string }[];
}

export type ChromeInstallableName = Extract<BrowserOrDriverName, 'chrome' | 'chromedriver'>;
export type ChromeChannelName = 'stable' | 'beta' | 'dev' | 'canary';

const defaultChromeChannelName = (): ChromeChannelName => 'stable';

export const ChromePlatform = ['mac-arm64', 'mac-x64', 'win64', 'linux64'] as const;
export type ChromePlatform = (typeof ChromePlatform)[number];
const isValidChromePlatform = (value: string): value is ChromePlatform => ChromePlatform.includes(value as ChromePlatform);

interface GetLatestVersionOptions {
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

interface FindVersionOptions {
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

interface GetChromePlatformOptions {
  platform?: NodeJS.Platform;
  arch?: NodeJS.Architecture;
}

function mergeGetChromePlatformOptions(options?: GetChromePlatformOptions): Required<GetChromePlatformOptions> {
  return {
    platform: process.platform,
    arch: process.arch,
    ...options,
  };
}

interface GetDownloadFileNameOptions {
  installableName: ChromeInstallableName;
  platform: ChromePlatform;
}

export interface GetDownloadUrlOptions {
  version: string;
  platform: ChromePlatform;
  downloadFileName: string;
}

export interface FindInstallationsOptions {
  rootPath: string;
}

export interface FindInstallationsResult {
  installations: {
    installableName: ChromeInstallableName;
    version: string;
    platform: ChromePlatform;
    executablePath: string;
  }[];
}

export interface GetInstallPathOptions {
  installableName: ChromeInstallableName;
  version: string;
  platform: ChromePlatform;
  rootPath: string;
}

export interface GetExecutablePathOptions {
  installableName: ChromeInstallableName;
  version: BrowserVersion;
  platform: ChromePlatform;
  installPath: string;
}

export interface InstallOptions {
  installableName: ChromeInstallableName;
  version: string;
  platform: ChromePlatform;
  rootPath: string;
  downloadTimeout?: number;
}

function mergeInstallOptions(options: InstallOptions): Required<InstallOptions> {
  return {
    downloadTimeout: defaultVersionRequestTimeout(),
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

  async getLatestVersion(options?: GetLatestVersionOptions): Promise<string> {
    const mergedOptions = mergeGetLatestVersionOptions(options);
    const { channelName, timeout } = mergedOptions;
    const lastKnownGoodVersions = await this.lastKnownGoodVersionsCache.get({
      timeout,
    });
    const lastKnownGoodVersionsChannel = lastKnownGoodVersionsChannelMap[channelName];
    const version = lastKnownGoodVersions.channels[lastKnownGoodVersionsChannel].version;
    return version;
  }

  async findVersion(options?: FindVersionOptions): Promise<string | undefined> {
    const mergedOptions = mergeFindVersionOptions(options);
    validatePrefixOrPatternWithin(mergedOptions);

    const { prefix, pattern, timeout } = mergedOptions;
    const knownGoodVersions = await this.knownGoodVersionsCache.get({
      timeout,
    });

    const versions = [...knownGoodVersions.versions];
    versions.sort((lhs, rhs) => {
      const lhsVersion = chromeVersionUtils.parse(lhs);
      const rhsVersion = chromeVersionUtils.parse(rhs);
      return chromeVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
    });

    if (prefix) {
      const version = versions.find(({ version }) => version.startsWith(prefix))?.version;
      return version;
    }

    if (pattern) {
      const version = versions.find(({ version }) => pattern.test(version))?.version;
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
    const { rootPath } = options;
    const installables = _.keys(executablePathMap) as ChromeInstallableName[];
    const withInstallablePathPromisess = installables.map(async (installableName) => {
      const installablePath = path.resolve(rootPath, installableName);
      const installablePathExist = await fs.promises
        .stat(installablePath)
        .then((stat) => stat.isDirectory())
        .catch(() => false);
      return {
        installableName,
        installablePath,
        installablePathExist,
      };
    });
    const withInstallablePaths = await Promise.all(withInstallablePathPromisess);
    const resultPromises = withInstallablePaths
      .filter(({ installablePathExist }) => installablePathExist)
      .map(async ({ installableName, installablePath }) => {
        const versions = await fs.promises.readdir(installablePath);
        const withVersionPromises = versions
          .filter((version) => {
            try {
              chromeVersionUtils.parse(version);
              return true;
            } catch {
              return false;
            }
          })
          .map(async (version) => {
            const versionPath = path.resolve(installablePath, version);
            const versionPathExist = await fs.promises
              .stat(versionPath)
              .then((stat) => stat.isDirectory())
              .catch(() => false);
            return {
              installableName,
              version,
              versionPath,
              versionPathExist,
            };
          });
        const withVersions = await Promise.all(withVersionPromises);
        const resultPromises = withVersions
          .filter(({ versionPathExist }) => versionPathExist)
          .map(async ({ installableName, version, versionPath }) => {
            const platforms = await fs.promises.readdir(versionPath);
            const withPlatformPromises = platforms
              .filter((platform) => isValidChromePlatform(platform))
              .map((platform) => platform as ChromePlatform)
              .map(async (platform) => {
                const platformPath = path.resolve(versionPath, platform);
                const platformPathExist = await fs.promises
                  .stat(platformPath)
                  .then((stat) => stat.isDirectory())
                  .catch(() => false);
                return {
                  installableName,
                  version,
                  platform,
                  platformPath,
                  platformPathExist,
                };
              });
            const withPlatforms = await Promise.all(withPlatformPromises);
            const withExecutablePromises = withPlatforms
              .filter(({ platformPathExist }) => platformPathExist)
              .map(async ({ installableName, version, platform, platformPath }) => {
                const executablePath = this.getExecutablePath({ installableName, version, platform, installPath: platformPath });
                const executablePathExist = await fs.promises
                  .stat(executablePath)
                  .then((stat) => stat.isFile())
                  .catch(() => false);
                return {
                  installableName,
                  version,
                  platform,
                  executablePath,
                  executablePathExist,
                };
              });
            const withExecutables = await Promise.all(withExecutablePromises);
            const results = withExecutables
              .filter(({ executablePathExist }) => executablePathExist)
              .map(({ installableName, version, platform, executablePath }) => ({
                installableName,
                version,
                platform,
                executablePath,
              }));
            return results;
          });
        const results = await Promise.all(resultPromises);
        return results.flat();
      });
    const results = await Promise.all(resultPromises);
    const installations = results.flat();
    return {
      installations,
    };
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

  getChromePlatform(options?: GetChromePlatformOptions): ChromePlatform {
    const mergedOptions = mergeGetChromePlatformOptions(options);
    const { platform, arch } = mergedOptions;
    const chromePlatform = _.get(chromePlatformMap, [platform, arch]) as string | undefined;
    if (!chromePlatform) {
      throw new Error(`Unsupported platform: ${platform}, arch: ${arch}`);
    }
    if (!isValidChromePlatform(chromePlatform)) {
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
