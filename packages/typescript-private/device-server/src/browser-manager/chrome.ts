import { BrowserOrDriverName } from '@dogu-private/types';
import { PrefixLogger, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import { renameRetry } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import axios, { AxiosInstance } from 'axios';
import compressing from 'compressing';
import fs from 'fs';
import _ from 'lodash';
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
  DownloadRequestTimeoutWithin,
  PlatformWithin,
  PrefixOrPatternWithin,
  RootPathWithin,
  validatePrefixOrPatternWithin,
  VersionRequestTimeoutWithin,
  VersionWithin,
} from './common';
import { WebCache } from './web-cache';

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

export type InstallableName = Extract<BrowserOrDriverName, 'chrome' | 'chromedriver'>;

interface InstallableNameWithin {
  /**
   * @description Installable name
   */
  installableName: InstallableName;
}

export type ChannelName = 'stable' | 'beta' | 'dev' | 'canary';

interface ChannelNameWithin {
  /**
   * @description Channel name
   * @default 'Stable'
   */
  channelName?: ChannelName;
}

function defaultChannelNameWithin(): Required<ChannelNameWithin> {
  return {
    channelName: 'stable',
  };
}

export type GetLatestVersionOptions = ChannelNameWithin & VersionRequestTimeoutWithin;
export type FindVersionOptions = PrefixOrPatternWithin & VersionRequestTimeoutWithin;
export type GetChromePlatformOptions = PlatformWithin & ArchWithin;
export type GetDownloadFileNameOptions = InstallableNameWithin & PlatformWithin & ArchWithin;
export type GetDownloadUrlOptions = InstallableNameWithin & VersionWithin & PlatformWithin & ArchWithin;
export type GetInstallationsOptions = RootPathWithin;
export type GetInstallPathOptions = RootPathWithin & InstallableNameWithin & VersionWithin & PlatformWithin & ArchWithin;
export type GetExecutablePathOptions = RootPathWithin & InstallableNameWithin & VersionWithin & PlatformWithin & ArchWithin;
export type InstallOptions = RootPathWithin & InstallableNameWithin & VersionWithin & PlatformWithin & ArchWithin & DownloadRequestTimeoutWithin;

export interface InstallResult {
  executablePath: string;
}

export interface GetInstallationsResult {
  installations: {
    installableName: InstallableName;
    version: string;
    platform: NodeJS.Platform;
    arch: NodeJS.Architecture;
    executablePath: string;
  }[];
}

export class Chrome {
  static readonly downloadBaseUrl = 'https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing';
  static readonly executablePathMap: DeepReadonly<Record<InstallableName, Record<string, string[]>>> = {
    chrome: {
      darwin: ['Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
      win32: ['chrome.exe'],
      linux: ['chrome'],
    },
    chromedriver: {
      darwin: ['chromedriver'],
      win32: ['chromedriver.exe'],
      linux: ['chromedriver'],
    },
  };
  static readonly chromePlatformMap: DeepReadonly<Record<string, Record<string, string>>> = {
    darwin: {
      arm64: 'mac-arm64',
      x64: 'mac-x64',
    },
    win32: {
      x64: 'win64',
      ia32: 'win32',
    },
    linux: {
      x64: 'linux64',
    },
  };
  static readonly lastKnownGoodVersionsChannelMap: DeepReadonly<Record<ChannelName, keyof LastKnownGoodVersions['channels']>> = {
    stable: 'Stable',
    beta: 'Beta',
    dev: 'Dev',
    canary: 'Canary',
  };

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
    const mergedOptions = _.merge(defaultChannelNameWithin(), defaultVersionRequestTimeoutWithin(), options);
    const { channelName, timeout } = mergedOptions;
    const lastKnownGoodVersions = await this.lastKnownGoodVersionsCache.get({
      timeout,
    });
    const lastKnownGoodVersionsChannel = Chrome.lastKnownGoodVersionsChannelMap[channelName];
    const version = lastKnownGoodVersions.channels[lastKnownGoodVersionsChannel].version;
    return version;
  }

  async findVersion(options?: FindVersionOptions): Promise<string | undefined> {
    const mergedOptions = _.merge(defaultVersionRequestTimeoutWithin(), options);
    validatePrefixOrPatternWithin(mergedOptions);

    const { prefix, pattern, timeout } = mergedOptions;
    const knownGoodVersions = await this.knownGoodVersionsCache.get({
      timeout,
    });

    const reversedVersions = [...knownGoodVersions.versions].reverse();
    if (prefix) {
      const version = reversedVersions.find(({ version }) => version.startsWith(prefix))?.version;
      return version;
    }

    if (pattern) {
      const version = reversedVersions.find(({ version }) => pattern.test(version))?.version;
      return version;
    }

    throw new Error('Unexpected find version process');
  }

  async install(options: InstallOptions): Promise<InstallResult> {
    const mergedOptions = _.merge(defaultRootPathWithin(), defaultPlatformWithin(), defaultArchWithin(), defaultDownloadRequestTimeoutWithin(), options);
    const { installableName, version, timeout } = mergedOptions;
    const installPath = this.getInstallPath(mergedOptions);
    return await this.pathLock.acquire(installPath, async () => {
      const executablePath = this.getExecutablePath(mergedOptions);
      if (await fs.promises.stat(executablePath).catch(() => null)) {
        this.logger.info(`Already installed at ${installPath}`);
        return {
          executablePath,
        };
      }

      await fs.promises.mkdir(installPath, { recursive: true });
      const downloadUrl = this.getDownloadUrl({ installableName, version });
      const downloadFileName = this.getDownloadFileName({ installableName });
      const downloadFilePath = path.resolve(installPath, downloadFileName);
      try {
        const response = await this.client.get(downloadUrl, {
          timeout,
          responseType: 'stream',
        });
        const writer = fs.createWriteStream(downloadFilePath);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        response.data.pipe(writer);
        await new Promise<void>((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
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

  async getInstallations(options?: GetInstallationsOptions): Promise<GetInstallationsResult> {
    const mergedOptions = _.merge(defaultRootPathWithin(), options);
    const { rootPath } = mergedOptions;

    const platformArchs = _.entries(Chrome.chromePlatformMap).flatMap(([platform, archMap]) => _.keys(archMap).map((arch) => ({ platform, arch })));
    const installables = await Promise.all(
      _.keys(Chrome.executablePathMap)
        .map((installableName) => ({
          installableName: installableName as InstallableName,
          installablePath: path.resolve(rootPath, installableName),
        }))
        .map(async ({ installableName, installablePath }) => ({
          installableName,
          installablePath,
          installableExist: await fs.promises
            .stat(installablePath)
            .then((stat) => stat.isDirectory())
            .catch(() => false),
        })),
    );

    const withArchs = await Promise.all(
      installables
        .filter(({ installableExist }) => installableExist)
        .map(({ installableName, installablePath }) => ({
          installableName,
          installablePath,
        }))
        .map(async ({ installableName, installablePath }) => {
          const versions = await fs.promises.readdir(installablePath);
          return versions.flatMap((version) =>
            platformArchs.map(({ platform, arch }) => ({ installableName, version, platform: platform as NodeJS.Platform, arch: arch as NodeJS.Architecture })),
          );
        }),
    ).then((installationss) => installationss.flat());

    const withExecutables = await Promise.all(
      withArchs.map(async (withArch) => {
        const executablePath = this.getExecutablePath(withArch);
        const executableExist = await fs.promises
          .stat(executablePath)
          .then((stat) => stat.isFile())
          .catch(() => false);
        return {
          ...withArch,
          executableExist,
          executablePath,
        };
      }),
    );

    const installations = withExecutables.filter(({ executableExist }) => executableExist).map(({ executableExist, ...rest }) => rest);
    return {
      installations,
    };
  }

  getDownloadFileName(options: GetDownloadFileNameOptions): string {
    const mergedOptions = _.merge(defaultPlatformWithin(), defaultArchWithin(), options);
    const { installableName } = mergedOptions;
    const chromePlatform = this.getChromePlatform(mergedOptions);
    const fileName = `${installableName}-${chromePlatform}.zip`;
    return fileName;
  }

  getDownloadUrl(options: GetDownloadUrlOptions): string {
    const mergedOptions = _.merge(defaultPlatformWithin(), defaultArchWithin(), options);
    const { version } = mergedOptions;
    const downloadFileName = this.getDownloadFileName(mergedOptions);
    const chromePlatform = this.getChromePlatform(mergedOptions);
    const url = `${Chrome.downloadBaseUrl}/${version}/${chromePlatform}/${downloadFileName}`;
    return url;
  }

  getChromePlatform(options?: GetChromePlatformOptions): string {
    const mergedOptions = _.merge(defaultPlatformWithin(), defaultArchWithin(), options);
    const { platform, arch } = mergedOptions;
    const chromePlatform = _.get(Chrome.chromePlatformMap, [platform, arch]) as string | undefined;
    if (!chromePlatform) {
      throw new Error(`Unsupported platform: ${platform}, arch: ${arch}`);
    }
    return chromePlatform;
  }

  getInstallPath(options: GetInstallPathOptions): string {
    const mergedOptions = _.merge(defaultRootPathWithin(), defaultPlatformWithin(), defaultArchWithin(), options);
    const { installableName, version, rootPath, platform, arch } = mergedOptions;
    const installPath = path.resolve(rootPath, installableName, version, platform, arch);
    return installPath;
  }

  getExecutablePath(options: GetExecutablePathOptions): string {
    const mergedOptions = _.merge(defaultRootPathWithin(), defaultPlatformWithin(), defaultArchWithin(), options);
    const { installableName, platform, arch } = mergedOptions;
    const installPath = this.getInstallPath(mergedOptions);
    const relativeExecutablePath = _.get(Chrome.executablePathMap, [installableName, platform]) as string[] | undefined;
    if (!relativeExecutablePath) {
      throw new Error(`Unsupported platform: ${platform}, arch: ${arch}`);
    }
    const executablePath = path.resolve(installPath, ...relativeExecutablePath);
    return executablePath;
  }
}
