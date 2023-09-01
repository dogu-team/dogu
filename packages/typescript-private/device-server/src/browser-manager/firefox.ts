import { BrowserOrDriverName } from '@dogu-private/types';
import { PrefixLogger, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import { onDmgMounted } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import _ from 'lodash';
import os from 'os';
import path from 'path';
import { logger } from '../logger/logger.instance';
import {
  ArchWithin,
  DeepReadonly,
  defaultArchWithin,
  defaultDownloadRequestTimeoutWithin,
  defaultPlatformWithin,
  defaultRootPathWithin,
  defaultVersionRequestTimeoutWithin,
  download,
  DownloadRequestTimeoutWithin,
  InstallableNameWithin,
  PlatformWithin,
  PrefixOrPatternWithin,
  RootPathWithin,
  validatePrefixOrPatternWithin,
  VersionRequestTimeoutWithin,
  VersionWithin,
} from './common';
import { firefoxVersionUtils } from './firefox-version-utils';
import { WebCache } from './web-cache';

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

export type FirefoxInstallableName = Extract<BrowserOrDriverName, 'firefox' | 'firefox-devedition' | 'geckodriver'>;
export type FirefoxInstallableNameWithin = InstallableNameWithin<FirefoxInstallableName>;

export type FirefoxNodeJSPlatform = Extract<NodeJS.Platform, 'darwin' | 'win32' | 'linux'>;

export type GetLatestVersionOptions = FirefoxInstallableNameWithin & VersionRequestTimeoutWithin;
export type FindVersionOptions = FirefoxInstallableNameWithin & PrefixOrPatternWithin & VersionRequestTimeoutWithin;
export type InstallOptions = RootPathWithin & FirefoxInstallableNameWithin & VersionWithin & PlatformWithin & ArchWithin & DownloadRequestTimeoutWithin;
export interface InstallResult {
  executablePath: string;
}

export type GetInstallPathOptions = RootPathWithin & FirefoxInstallableNameWithin & VersionWithin & PlatformWithin & ArchWithin;
export type GetExecutablePathOptions = RootPathWithin & FirefoxInstallableNameWithin & VersionWithin & PlatformWithin & ArchWithin;
export type GetFirefoxPlatformOptions = PlatformWithin & ArchWithin;
export type GetDownloadFileNameOptions = FirefoxInstallableNameWithin & VersionWithin & PlatformWithin;
export type GetDownloadUrlOptions = FirefoxInstallableNameWithin & VersionWithin & PlatformWithin & ArchWithin;

export class Firefox {
  static readonly firefoxDownloadBaseUrl = 'https://ftp.mozilla.org/pub';
  static readonly defaultLocale = 'en-US';
  static readonly latestVersionMap: DeepReadonly<Record<Extract<FirefoxInstallableName, 'firefox' | 'firefox-devedition'>, keyof DetailsFirefoxVersions>> = {
    firefox: 'LATEST_FIREFOX_VERSION',
    'firefox-devedition': 'LATEST_FIREFOX_DEVEL_VERSION',
  };
  static readonly executablePathMap: DeepReadonly<Record<FirefoxInstallableName, Record<string, string[]>>> = {
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
    geckodriver: {
      darwin: ['geckodriver'],
      win32: ['geckodriver.exe'],
      linux: ['geckodriver'],
    },
  };
  static readonly firefoxPlatformMap: DeepReadonly<Record<FirefoxNodeJSPlatform, Record<string, string>>> = {
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
  static readonly firefoxInstallableMap: DeepReadonly<Record<FirefoxInstallableName, string>> = {
    firefox: 'firefox',
    'firefox-devedition': 'devedition',
    geckodriver: 'geckodriver',
  };

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
    const mergedOptions = _.merge(
      defaultVersionRequestTimeoutWithin(), //
      options,
    );
    const { installableName, timeout } = mergedOptions;
    switch (installableName) {
      case 'firefox':
      case 'firefox-devedition': {
        const details = await this.detailsFirefoxVersionsCache.get({ timeout });
        const version = details[Firefox.latestVersionMap[installableName]];
        return version;
      }
      case 'geckodriver':
        throw new Error('Not implemented');
      default:
        const _: never = installableName;
        throw new Error(`Unexpected installableName: ${_}`);
    }
  }

  async findVersion(options?: FindVersionOptions): Promise<string | undefined> {
    const mergedOptions = _.merge(
      defaultVersionRequestTimeoutWithin(), //
      options,
    );
    validatePrefixOrPatternWithin(mergedOptions);

    const { installableName, timeout, prefix, pattern } = mergedOptions;
    switch (installableName) {
      case 'firefox':
      case 'firefox-devedition': {
        const details =
          installableName === 'firefox'
            ? await this.detailsFirefoxCache.get({ timeout })
            : installableName === 'firefox-devedition'
            ? await this.detailsDeveditionCache.get({ timeout })
            : installableName; // never

        const firefoxInstallableName = Firefox.firefoxInstallableMap[installableName];
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
      case 'geckodriver':
        throw new Error('Not implemented');
      default:
        const _: never = installableName;
        throw new Error(`Unexpected installableName: ${_}`);
    }
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
    const mergedOptions = _.merge(
      defaultPlatformWithin(), //
      options,
    );
    const { installableName, version, platform } = mergedOptions;
    switch (installableName) {
      case 'firefox':
      case 'firefox-devedition':
        switch (platform) {
          case 'darwin':
            return `Firefox ${version}.dmg`;
          case 'win32':
            return `Firefox Setup ${version}.exe`;
          case 'linux':
            return `firefox-${version}.tar.bz2`;
          default:
            throw new Error(`Unexpected platform for download file name: ${platform}`);
        }
      case 'geckodriver':
        throw new Error('Not implemented');
      default:
        const _: never = installableName;
        throw new Error(`Unexpected installableName: ${_}`);
    }
  }

  getDownloadUrl(options: GetDownloadUrlOptions): string {
    const mergedOptions = _.merge(
      defaultPlatformWithin(), //
      defaultArchWithin(),
      options,
    );
    const { installableName, version } = mergedOptions;
    const downloadFileName = this.getDownloadFileName(mergedOptions);
    const firefoxPlatform = this.getFirefoxPlatform(mergedOptions);
    const firefoxInstallableName = Firefox.firefoxInstallableMap[installableName];
    switch (installableName) {
      case 'firefox':
      case 'firefox-devedition':
        return `${Firefox.firefoxDownloadBaseUrl}/${firefoxInstallableName}/releases/${version}/${firefoxPlatform}/${Firefox.defaultLocale}/${downloadFileName}`;
      case 'geckodriver':
        throw new Error('Not implemented');
      default:
        const _: never = installableName;
        throw new Error(`Unexpected installableName: ${_}`);
    }
  }

  getFirefoxPlatform(options?: GetFirefoxPlatformOptions): string {
    const mergedOptions = _.merge(defaultPlatformWithin(), defaultArchWithin(), options);
    const { platform, arch } = mergedOptions;
    const firefoxPlatform = _.get(Firefox.firefoxPlatformMap, [platform, arch]) as string | undefined;
    if (!firefoxPlatform) {
      throw new Error(`Unsupported platform: ${platform}, arch: ${arch}`);
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
