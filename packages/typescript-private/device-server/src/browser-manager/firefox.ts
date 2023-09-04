import { BrowserOrDriverName, BrowserVersion } from '@dogu-private/types';
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

const executablePathMap: DeepReadonly<Record<FirefoxInstallableName, Record<FirefoxPlatform, string[]>>> = {
  firefox: {
    mac: ['Firefox.app', 'Contents', 'MacOS', 'firefox'],
    win64: ['firefox.exe'],
    'linux-x86_64': ['firefox'],
  },
  'firefox-devedition': {
    mac: ['Firefox Developer Edition.app', 'Contents', 'MacOS', 'firefox'],
    win64: ['firefox.exe'],
    'linux-x86_64': ['firefox'],
  },
};

const firefoxPlatformMap: DeepReadonly<Record<Extract<NodeJS.Platform, 'darwin' | 'win32' | 'linux'>, Record<string, FirefoxPlatform>>> = {
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
    [version: BrowserVersion]: unknown;
  };
}

interface DetailsDevedition {
  releases: {
    [version: BrowserVersion]: unknown;
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
  version: BrowserVersion;
  platform: FirefoxPlatform;
}

export interface GetDownloadUrlOptions {
  installableName: FirefoxInstallableName;
  version: BrowserVersion;
  platform: FirefoxPlatform;
  downloadFileName: string;
}

export interface GetInstallPathOptions {
  installableName: FirefoxInstallableName;
  version: BrowserVersion;
  platform: FirefoxPlatform;
  rootPath: string;
}

export interface GetExecutablePathOptions {
  installableName: FirefoxInstallableName;
  platform: FirefoxPlatform;
  installPath: string;
}

export interface FindInstallationsOptions {
  installableName: FirefoxInstallableName;
  platform: FirefoxPlatform;
  rootPath: string;
}

export type FindInstallationsResult = {
  installableName: FirefoxInstallableName;
  version: BrowserVersion;
  majorVersion: number;
  platform: FirefoxPlatform;
  executablePath: string;
}[];

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

  async findInstallations(options: FindInstallationsOptions): Promise<FindInstallationsResult> {
    const { installableName, platform: requestedPlatform, rootPath } = options;
    const installableNames = _.keys(firefoxInstallableMap) as FirefoxInstallableName[];
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
              const parsed = firefoxVersionUtils.parse(version);
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
    const { installableName, platform, installPath } = options;
    const relativeExecutablePath = executablePathMap[installableName][platform];
    const executablePath = path.resolve(installPath, ...relativeExecutablePath);
    return executablePath;
  }

  getInstallPath(options: GetInstallPathOptions): string {
    const { installableName, version, platform, rootPath } = options;
    const installPath = path.resolve(rootPath, installableName, version, platform);
    return installPath;
  }
}
