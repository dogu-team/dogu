import { BrowserOrDriverName } from '@dogu-private/types';
import { assertUnreachable, DeepReadonly, PrefixLogger, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import { onDmgMounted } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import _ from 'lodash';
import os from 'os';
import path from 'path';
import { logger } from '../logger/logger.instance';
import { defaultVersionRequestTimeout, validatePrefixOrPatternWithin } from './common';
import { firefoxVersionUtils } from './firefox-version-utils';
import { WebCache } from './web-cache';

export type FirefoxInstallableName = Extract<BrowserOrDriverName, 'firefox' | 'firefox-devedition'>;

export const FirefoxPlatform = ['mac', 'win64', 'linux-x86_64'] as const;
export type FirefoxPlatform = (typeof FirefoxPlatform)[number];
const isValidFirefoxPlatform = (value: string): value is FirefoxPlatform => FirefoxPlatform.includes(value as FirefoxPlatform);

const firefoxDownloadBaseUrl = 'https://ftp.mozilla.org/pub';
const defaultLocale = 'en-US';

const latestVersionMap: DeepReadonly<Record<Extract<FirefoxInstallableName, 'firefox' | 'firefox-devedition'>, keyof DetailsFirefoxVersions>> = {
  firefox: 'LATEST_FIREFOX_VERSION',
  'firefox-devedition': 'LATEST_FIREFOX_DEVEL_VERSION',
};

const executablePathMap: DeepReadonly<Record<FirefoxInstallableName, Record<string, string[]>>> = {
  firefox: {
    darwin: ['Firefox.app', 'Contents', 'MacOS', 'firefox'],
    win32: ['firefox.exe'],
    linux: ['firefox'],
  },
  'firefox-devedition': {
    darwin: ['Firefox Developer Edition.app', 'Contents', 'MacOS', 'firefox'],
    win32: ['firefox.exe'],
    linux: ['firefox'],
  },
};

const firefoxPlatformMap: DeepReadonly<Record<Extract<NodeJS.Platform, 'darwin' | 'win32' | 'linux'>, Record<string, string>>> = {
  darwin: {
    arm64: 'mac',
    x64: 'mac',
  },
  win32: {
    x64: 'win64',
  },
  linux: {
    x64: 'linux-x86_64',
  },
};

const firefoxInstallableMap: DeepReadonly<Record<FirefoxInstallableName, string>> = {
  firefox: 'firefox',
  'firefox-devedition': 'devedition',
};

interface DetailsFirefoxVersions {
  LATEST_FIREFOX_VERSION: string;
  LATEST_FIREFOX_DEVEL_VERSION: string;
}

interface DetailsFirefox {
  releases: {
    [version: string]: unknown;
  };
}

interface DetailsDevedition {
  releases: {
    [version: string]: unknown;
  };
}

export interface GetLatestVersionOptions {
  installableName: FirefoxInstallableName;
  timeout?: number;
}

function mergeGetLatestVersionOptions(options: GetLatestVersionOptions): Required<GetLatestVersionOptions> {
  return {
    timeout: defaultVersionRequestTimeout(),
    ...options,
  };
}

export interface FindVersionOptions {
  installableName: FirefoxInstallableName;
  prefix?: string | null;
  pattern?: RegExp | null;
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

export interface GetFirefoxPlatformOptions {
  platform?: NodeJS.Platform;
  arch?: string;
}

function mergeGetFirefoxPlatformOptions(options?: GetFirefoxPlatformOptions): Required<GetFirefoxPlatformOptions> {
  return {
    platform: process.platform,
    arch: process.arch,
    ...options,
  };
}

export interface GetDownloadFileNameOptions {
  installableName: FirefoxInstallableName;
  version: string;
  platform: FirefoxPlatform;
}

export interface GetDownloadUrlOptions {
  installableName: FirefoxInstallableName;
  version: string;
  platform: FirefoxPlatform;
  downloadFileName: string;
}

export interface FindInstallationsOptions {
  installableName: FirefoxInstallableName;
  platform: FirefoxPlatform;
  rootPath: string;
}

export class Firefox {
  private readonly logger = new PrefixLogger(logger, `[${this.constructor.name}]`);
  private readonly client: AxiosInstance;
  private readonly detailsFirefoxVersionsCache: WebCache<DetailsFirefoxVersions>;
  private readonly detailsFirefoxCache: WebCache<DetailsFirefox>;
  private readonly detailsDeveditionCache: WebCache<DetailsDevedition>;
  private readonly pathLock = new AsyncLock();

  constructor() {
    const client = axios.create();
    setAxiosErrorFilterToIntercepter(client);
    this.client = client;
    this.detailsFirefoxVersionsCache = new WebCache<DetailsFirefoxVersions>({
      name: 'firefox-versions',
      url: 'https://product-details.mozilla.org/1.0/firefox_versions.json',
      client,
    });
    this.detailsFirefoxCache = new WebCache<DetailsFirefox>({
      name: 'firefox',
      url: 'https://product-details.mozilla.org/1.0/firefox.json',
      client,
    });
    this.detailsDeveditionCache = new WebCache<DetailsDevedition>({
      name: 'devedition',
      url: 'https://product-details.mozilla.org/1.0/devedition.json',
      client,
    });
  }

  async getLatestVersion(options: GetLatestVersionOptions): Promise<string> {
    const mergedOptions = mergeGetLatestVersionOptions(options);
    const { installableName, timeout } = mergedOptions;
    switch (installableName) {
      case 'firefox':
      case 'firefox-devedition': {
        const details = await this.detailsFirefoxVersionsCache.get({ timeout });
        const version = details[latestVersionMap[installableName]];
        return version;
      }
      default:
        assertUnreachable(installableName);
    }
  }

  async findVersion(options: FindVersionOptions): Promise<string | undefined> {
    const mergedOptions = mergeFindVersionOptions(options);
    validatePrefixOrPatternWithin(mergedOptions);

    const { installableName, timeout, prefix, pattern } = mergedOptions;
    let details: DeepReadonly<DetailsFirefox> | undefined;
    switch (installableName) {
      case 'firefox':
        details = await this.detailsFirefoxCache.get({ timeout });
        break;
      case 'firefox-devedition':
        details = await this.detailsDeveditionCache.get({ timeout });
        break;
      default:
        assertUnreachable(installableName);
    }

    const firefoxInstallableName = firefoxInstallableMap[installableName];
    const versions = Object.keys(details.releases).map((version) => version.replace(`${firefoxInstallableName}-`, ''));
    versions.sort((lhs, rhs) => {
      const lhsVersion = firefoxVersionUtils.parse(lhs);
      const rhsVersion = firefoxVersionUtils.parse(rhs);
      return firefoxVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
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
    const mergedOptions = _.merge(
      defaultRootPathWithin(), //
      defaultDownloadRequestTimeoutWithin(),
      options,
    );
    const { installableName, timeout } = mergedOptions;
    const installPath = this.getInstallPath(mergedOptions);
    return await this.pathLock.acquire(installPath, async () => {
      const executablePath = this.getExecutablePath(mergedOptions);
      if (await fs.promises.stat(executablePath).catch(() => null)) {
        this.logger.debug(`Already installed at ${installPath}`);
        return { executablePath };
      }

      await fs.promises.mkdir(installPath, { recursive: true });
      const downloadUrl = this.getDownloadUrl(mergedOptions);
      const downloadFileName = this.getDownloadFileName(mergedOptions);
      const downloadFilePath = path.resolve(installPath, downloadFileName);
      try {
        await download({
          client: this.client,
          url: downloadUrl,
          filePath: downloadFilePath,
          timeout,
        });

        if (downloadFileName.toLowerCase().endsWith('.dmg')) {
          const mountPath = path.resolve(os.homedir(), `dmp-${Date.now()}`);
          await onDmgMounted(downloadFilePath, mountPath, timeout, async (mountPath) => {
            const appName = Firefox.executablePathMap[installableName][process.platform][0];
            await fs.promises.cp(path.resolve(mountPath, appName), path.resolve(installPath, appName), {
              recursive: true,
              force: true,
            });
          });
        } else {
          throw new Error(`Unexpected download file name: ${downloadFileName}`);
        }

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

  getDownloadFileName(options: GetDownloadFileNameOptions): string {
    const { installableName, version, platform } = options;
    switch (installableName) {
      case 'firefox':
      case 'firefox-devedition':
        switch (platform) {
          case 'mac':
            return `Firefox ${version}.dmg`;
          case 'win64':
            return `Firefox Setup ${version}.exe`;
          case 'linux-x86_64':
            return `firefox-${version}.tar.bz2`;
          default:
            assertUnreachable(platform);
        }
        break;
      default:
        assertUnreachable(installableName);
    }
  }

  getDownloadUrl(options: GetDownloadUrlOptions): string {
    const { installableName, version, platform, downloadFileName } = options;
    const firefoxInstallableName = firefoxInstallableMap[installableName];
    switch (installableName) {
      case 'firefox':
      case 'firefox-devedition':
        return `${firefoxDownloadBaseUrl}/${firefoxInstallableName}/releases/${version}/${platform}/${defaultLocale}/${downloadFileName}`;
      default:
        assertUnreachable(installableName);
    }
  }

  getFirefoxPlatform(options?: GetFirefoxPlatformOptions): FirefoxPlatform {
    const mergedOptions = mergeGetFirefoxPlatformOptions(options);
    const { platform, arch } = mergedOptions;
    const firefoxPlatform = _.get(firefoxPlatformMap, [platform, arch]) as string | undefined;
    if (!firefoxPlatform) {
      throw new Error(`Unsupported platform: ${platform}, arch: ${arch}`);
    }

    if (!isValidFirefoxPlatform(firefoxPlatform)) {
      throw new Error(`Unexpected firefox platform: ${firefoxPlatform}`);
    }

    return firefoxPlatform;
  }

  getExecutablePath(options: GetExecutablePathOptions): string {
    const mergedOptions = _.merge(
      defaultRootPathWithin(), //
      defaultPlatformWithin(),
      defaultArchWithin(),
      options,
    );
    const installPath = this.getInstallPath(mergedOptions);
    const { installableName, platform } = mergedOptions;
    const relativeExecutablePath = _.get(Firefox.executablePathMap, [installableName, platform]) as string[] | undefined;
    if (!relativeExecutablePath) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    const executablePath = path.resolve(installPath, ...relativeExecutablePath);
    return executablePath;
  }

  getInstallPath(options: GetInstallPathOptions): string {
    const mergedOptions = _.merge(
      defaultRootPathWithin(), //
      defaultPlatformWithin(),
      defaultArchWithin(),
      options,
    );
    const { installableName, version, rootPath } = mergedOptions;
    const firefoxPlatform = this.getFirefoxPlatform(mergedOptions);
    const installPath = path.resolve(rootPath, installableName, version, firefoxPlatform);
    return installPath;
  }
}
