import { BrowserOrDriverName, BrowserVersion } from '@dogu-private/types';
import { assertUnreachable, DeepReadonly, PrefixLogger, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import { defaultMountTimeout, onDmgMounted } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import _ from 'lodash';
import os from 'os';
import path from 'path';
import { logger } from '../logger/logger.instance';
import { defaultDownloadRequestTimeout, defaultVersionRequestTimeout, download, validatePrefixOrPatternWithin } from './common';
import { firefoxVersionUtils } from './firefox-version-utils';
import { WebCache } from './web-cache';

export type FirefoxInstallableName = Extract<BrowserOrDriverName, 'firefox' | 'firefox-devedition'>;

export const FirefoxInstallablePlatform = ['mac', 'win64', 'linux-x86_64'] as const;
export type FirefoxInstallablePlatform = (typeof FirefoxInstallablePlatform)[number];
const isValidFirefoxInstallablePlatform = (value: string): value is FirefoxInstallablePlatform => FirefoxInstallablePlatform.includes(value as FirefoxInstallablePlatform);

const downloadBaseUrl = 'https://ftp.mozilla.org/pub';
const defaultLocale = 'en-US';

const latestVersionMap: DeepReadonly<Record<Extract<FirefoxInstallableName, 'firefox' | 'firefox-devedition'>, keyof DetailsFirefoxVersions>> = {
  firefox: 'LATEST_FIREFOX_VERSION',
  'firefox-devedition': 'LATEST_FIREFOX_DEVEL_VERSION',
};

const executablePathMap: DeepReadonly<Record<FirefoxInstallableName, Record<FirefoxInstallablePlatform, string[]>>> = {
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

const platformMap: DeepReadonly<Record<Extract<NodeJS.Platform, 'darwin' | 'win32' | 'linux'>, Record<string, FirefoxInstallablePlatform>>> = {
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

const installableMap: DeepReadonly<Record<FirefoxInstallableName, string>> = {
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

export interface GetFirefoxInstallablePlatformOptions {
  platform?: NodeJS.Platform;
  arch?: string;
}

function mergeGetFirefoxInstallablePlatformOptions(options?: GetFirefoxInstallablePlatformOptions): Required<GetFirefoxInstallablePlatformOptions> {
  return {
    platform: process.platform,
    arch: process.arch,
    ...options,
  };
}

export interface GetDownloadFileNameOptions {
  installableName: FirefoxInstallableName;
  version: BrowserVersion;
  platform: FirefoxInstallablePlatform;
}

export interface GetDownloadUrlOptions {
  installableName: FirefoxInstallableName;
  version: BrowserVersion;
  platform: FirefoxInstallablePlatform;
  downloadFileName: string;
}

export interface GetInstallPathOptions {
  installableName: FirefoxInstallableName;
  version: BrowserVersion;
  platform: FirefoxInstallablePlatform;
  rootPath: string;
}

export interface GetExecutablePathOptions {
  installableName: FirefoxInstallableName;
  platform: FirefoxInstallablePlatform;
  installPath: string;
}

export interface FindInstallationsOptions {
  installableName: FirefoxInstallableName;
  platform: FirefoxInstallablePlatform;
  rootPath: string;
}

export type FindInstallationsResult = {
  installableName: FirefoxInstallableName;
  version: BrowserVersion;
  majorVersion: number;
  platform: FirefoxInstallablePlatform;
  executablePath: string;
}[];

export interface InstallOptions {
  installableName: FirefoxInstallableName;
  version: BrowserVersion;
  platform: FirefoxInstallablePlatform;
  rootPath: string;
  downloadTimeout?: number;
  mountTimeout?: number;
}

function mergeInstallOptions(options: InstallOptions): Required<InstallOptions> {
  return {
    downloadTimeout: defaultDownloadRequestTimeout(),
    mountTimeout: defaultMountTimeout,
    ...options,
  };
}

export interface InstallResult {
  executablePath: string;
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

    const firefoxInstallableName = installableMap[installableName];
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
    const mergedOptions = mergeInstallOptions(options);
    const { installableName, platform, downloadTimeout } = mergedOptions;
    const installPath = this.getInstallPath(mergedOptions);
    return await this.pathLock.acquire(installPath, async () => {
      const executablePath = this.getExecutablePath({ ...mergedOptions, installPath });
      if (await fs.promises.stat(executablePath).catch(() => null)) {
        this.logger.debug(`Already installed at ${installPath}`);
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

        if (downloadFileName.toLowerCase().endsWith('.dmg')) {
          const mountPath = path.resolve(os.homedir(), `dmp-${Date.now()}`);
          await onDmgMounted(downloadFilePath, mountPath, defaultMountTimeout, async (mountPath) => {
            const appName = executablePathMap[installableName][platform][0];
            const sourcePath = path.resolve(mountPath, appName);
            const targetPath = path.resolve(installPath, appName);
            await fs.promises.cp(sourcePath, targetPath, {
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
    const installableNames = _.keys(installableMap) as FirefoxInstallableName[];
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
          .filter(({ platform }) => isValidFirefoxInstallablePlatform(platform))
          .map(({ installableName, version, majorVersion, platform }) => ({
            installableName,
            version,
            majorVersion,
            platform: platform as FirefoxInstallablePlatform,
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
        const lhsVersion = firefoxVersionUtils.parse(lhs.version);
        const rhsVersion = firefoxVersionUtils.parse(rhs.version);
        return firefoxVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
      });
    return withExecutablePathResults;
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
    const firefoxInstallableName = installableMap[installableName];
    switch (installableName) {
      case 'firefox':
      case 'firefox-devedition':
        return `${downloadBaseUrl}/${firefoxInstallableName}/releases/${version}/${platform}/${defaultLocale}/${downloadFileName}`;
      default:
        assertUnreachable(installableName);
    }
  }

  getFirefoxInstallablePlatform(options?: GetFirefoxInstallablePlatformOptions): FirefoxInstallablePlatform {
    const mergedOptions = mergeGetFirefoxInstallablePlatformOptions(options);
    const { platform, arch } = mergedOptions;
    const firefoxPlatform = _.get(platformMap, [platform, arch]) as string | undefined;
    if (!firefoxPlatform) {
      throw new Error(`Unsupported platform: ${platform}, arch: ${arch}`);
    }

    if (!isValidFirefoxInstallablePlatform(firefoxPlatform)) {
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
