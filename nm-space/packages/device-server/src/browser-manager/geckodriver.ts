import { BrowserOrDriverName, BrowserVersion } from '@dogu-private/types';
import { assertUnreachable, DeepReadonly, errorify, filterAsync, PrefixLogger } from '@dogu-tech/common';
import { defaultDownloadRequestTimeout, OctokitContext } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import compressing from 'compressing';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { logger } from '../logger/logger.instance';
import { chromeVersionUtils } from './chrome-version-utils';
import { defaultVersionRequestTimeout } from './common';

const geckodriverVersionUtils = chromeVersionUtils;

const owner = 'mozilla';
const repo = 'geckodriver';

/**
 * @example v0.33.0
 */
const tagNamePattern = /^v(?<version>.+)$/;

const executablePathMap: DeepReadonly<Record<GeckodriverInstallableName, Record<GeckodriverInstallablePlatform, string[]>>> = {
  geckodriver: {
    macos: ['geckodriver'],
    'macos-aarch64': ['geckodriver'],
    win64: ['geckodriver.exe'],
    linux64: ['geckodriver'],
  },
};

const platformMap: DeepReadonly<Record<Extract<NodeJS.Platform, 'darwin' | 'win32' | 'linux'>, Record<string, GeckodriverInstallablePlatform>>> = {
  darwin: {
    x64: 'macos',
    arm64: 'macos-aarch64',
  },
  win32: {
    x64: 'win64',
  },
  linux: {
    x64: 'linux64',
  },
};

export type GeckodriverInstallableName = Extract<BrowserOrDriverName, 'geckodriver'>;

export const GeckodriverInstallablePlatform = ['macos', 'macos-aarch64', 'win64', 'linux64'] as const;
export type GeckodriverInstallablePlatform = (typeof GeckodriverInstallablePlatform)[number];
const isValidGeckodriverInstallablePlatform = (value: string): value is GeckodriverInstallablePlatform =>
  GeckodriverInstallablePlatform.includes(value as GeckodriverInstallablePlatform);

export interface GetLatestVersionOptions {
  installableName: GeckodriverInstallableName;
  timeout?: number;
}

function mergeGetLatestVersionOptions(options: GetLatestVersionOptions): Required<GetLatestVersionOptions> {
  return {
    timeout: defaultVersionRequestTimeout(),
    ...options,
  };
}

export interface InstallOptions {
  installableName: GeckodriverInstallableName;
  version: string;
  platform: GeckodriverInstallablePlatform;
  rootPath: string;
  versionTimeout?: number;
  downloadTimeout?: number;
}

function mergeInstallOptions(options: InstallOptions): Required<InstallOptions> {
  return {
    versionTimeout: defaultVersionRequestTimeout(),
    downloadTimeout: defaultDownloadRequestTimeout(),
    ...options,
  };
}

export interface InstallResult {
  executablePath: string;
}

export interface GetInstallPathOptions {
  installableName: GeckodriverInstallableName;
  version: string;
  platform: GeckodriverInstallablePlatform;
  rootPath: string;
}

export interface GetExecutablePathOptions {
  installableName: GeckodriverInstallableName;
  platform: GeckodriverInstallablePlatform;
  installPath: string;
}

export interface GetGeckodriverInstallablePlatformOptions {
  platform?: NodeJS.Platform;
  arch?: string;
}

function mergeGetGeckodriverInstallablePlatformOptions(options?: GetGeckodriverInstallablePlatformOptions): Required<GetGeckodriverInstallablePlatformOptions> {
  return {
    platform: process.platform,
    arch: process.arch,
    ...options,
  };
}

function getVersionFromTagName(tagName: string): string {
  const match = tagName.match(tagNamePattern);
  if (!match) {
    throw new Error(`Invalid tag name: ${tagName}`);
  }

  const { version } = match.groups as Record<string, string | undefined>;
  if (!version) {
    throw new Error(`Invalid version: ${version}`);
  }

  return version;
}

/**
 * @example
 * geckodriver-v0.33.0-linux-aarch64.tar.gz
 * geckodriver-v0.33.0-linux32.tar.gz
 * geckodriver-v0.33.0-linux32.tar.gz.asc
 * geckodriver-v0.33.0-linux64.tar.gz
 * geckodriver-v0.33.0-linux64.tar.gz.asc
 * geckodriver-v0.33.0-macos-aarch64.tar.gz
 * geckodriver-v0.33.0-macos.tar.gz
 * geckodriver-v0.33.0-win-aarch64.zip
 * geckodriver-v0.33.0-win32.zip
 * geckodriver-v0.33.0-win64.zip
 */
const assetNamePattern = /^geckodriver-v(?<version>.+)-(?<platform>.+?)\.(?<extension>.+)$/;

export interface FindInstallationsOptions {
  installableName: GeckodriverInstallableName;
  platform: GeckodriverInstallablePlatform;
  rootPath: string;
}

export type FindInstallationsResult = {
  installableName: GeckodriverInstallableName;
  version: BrowserVersion;
  majorVersion: number;
  platform: GeckodriverInstallablePlatform;
  executablePath: string;
}[];

export class Geckodriver {
  private readonly logger = new PrefixLogger(logger, `[${this.constructor.name}]`);
  private readonly octikitContext = new OctokitContext(null);
  private readonly pathLock = new AsyncLock();

  async getLatestVersion(options: GetLatestVersionOptions): Promise<string> {
    const mergedOptions = mergeGetLatestVersionOptions(options);
    const { installableName, timeout } = mergedOptions;
    switch (installableName) {
      case 'geckodriver':
        {
          const releaseInfo = await this.octikitContext.getLatestReleaseInfo(owner, repo, timeout);
          const { tagName } = releaseInfo;
          return getVersionFromTagName(tagName);
        }
        break;
      default:
        assertUnreachable(installableName);
    }
  }

  async install(options: InstallOptions): Promise<InstallResult> {
    const mergedOptions = mergeInstallOptions(options);
    const { version, platform, versionTimeout } = mergedOptions;
    const releaseInfo = await this.octikitContext.getLatestReleaseInfo(owner, repo, versionTimeout);
    const latestVersion = getVersionFromTagName(releaseInfo.tagName);
    if (version !== latestVersion) {
      throw new Error(`Must be latest version: ${version} !== ${latestVersion}`);
    }

    const installPath = this.getInstallPath(mergedOptions);
    return await this.pathLock.acquire(installPath, async () => {
      const executablePath = this.getExecutablePath({ ...mergedOptions, installPath });
      if (await fs.promises.stat(executablePath).catch(() => null)) {
        this.logger.info(`Already installed at ${installPath}`);
        return { executablePath };
      }

      await fs.promises.mkdir(installPath, { recursive: true });
      const assetInfo = releaseInfo.assetInfos.find((assetInfo) => {
        const match = assetInfo.name.match(assetNamePattern);
        if (!match) {
          return false;
        }

        const { version: assetVersion, platform: assetPlatform, extension } = match.groups as Record<string, string | undefined>;
        if (!assetVersion || !assetPlatform || !extension) {
          return false;
        }

        if (assetVersion !== version) {
          return false;
        }

        if (assetPlatform !== platform) {
          return false;
        }

        return true;
      });

      if (!assetInfo) {
        throw new Error(`Not found asset: ${version} ${platform}`);
      }

      const downloadFileName = assetInfo.name;
      const downloadFilePath = path.resolve(installPath, downloadFileName);
      try {
        await this.octikitContext.downloadReleaseAsset(owner, repo, assetInfo.id, downloadFilePath, this.logger);
        if (downloadFileName.toLowerCase().endsWith('.zip')) {
          await compressing.zip.uncompress(downloadFilePath, installPath);
          return { executablePath };
        } else if (downloadFileName.toLowerCase().endsWith('.tar.gz')) {
          await compressing.tgz.uncompress(downloadFilePath, installPath);
          return { executablePath };
        } else {
          throw new Error(`Unsupported extension: ${downloadFileName}`);
        }
      } catch (error) {
        this.logger.error('Failed to download release asset', { error: errorify(error) });
        throw error;
      } finally {
        try {
          if (await fs.promises.stat(downloadFilePath).catch(() => false)) {
            await fs.promises.rm(downloadFilePath, { recursive: true, force: true });
          }
        } catch (error) {
          this.logger.error('Failed to remove download file', { error: errorify(error) });
        }
      }
    });
  }

  async findInstallations(options: FindInstallationsOptions): Promise<FindInstallationsResult> {
    const { installableName, platform: requestedPlatform, rootPath } = options;
    const installableNames: GeckodriverInstallableName[] = ['geckodriver'];

    const withInstallablePaths = await filterAsync(
      installableNames
        .filter((name) => name === installableName)
        .map((installableName) => ({
          installableName,
          installablePath: path.resolve(rootPath, installableName),
        })),
      async (value) =>
        fs.promises
          .stat(value.installablePath)
          .then((stat) => stat.isDirectory())
          .catch(() => false),
    );

    const withVersionPathss = await Promise.all(
      withInstallablePaths.map(async ({ installablePath, ...rest }) => {
        const versions = await fs.promises.readdir(installablePath);
        return await filterAsync(
          versions
            .map((version) => {
              try {
                const parsed = geckodriverVersionUtils.parse(version);
                return {
                  ...rest,
                  installablePath,
                  version,
                  majorVersion: parsed.major,
                };
              } catch (error) {
                this.logger.warn('Failed to parse version', { error: errorify(error) });
                return null;
              }
            })
            .filter((value): value is NonNullable<typeof value> => !!value)
            .map(({ installablePath, version, ...rest }) => ({ ...rest, version, versionPath: path.resolve(installablePath, version) })),
          async (value) =>
            fs.promises
              .stat(value.versionPath)
              .then((stat) => stat.isDirectory())
              .catch(() => false),
        );
      }),
    );
    const withVersionPaths = withVersionPathss.flat();

    const withPlatformPathss = await Promise.all(
      withVersionPaths.map(async ({ versionPath, ...rest }) => {
        const platforms = await fs.promises.readdir(versionPath);
        return await filterAsync(
          platforms
            .filter((platform) => platform === requestedPlatform)
            .filter((platform): platform is GeckodriverInstallablePlatform => isValidGeckodriverInstallablePlatform(platform))
            .map((platform) => ({ ...rest, platform, platformPath: path.resolve(versionPath, platform) })),
          async (value) =>
            fs.promises
              .stat(value.platformPath)
              .then((stat) => stat.isDirectory())
              .catch(() => false),
        );
      }),
    );
    const withPlatformPaths = withPlatformPathss.flat();

    const withExecutablePathss = await filterAsync(
      withPlatformPaths.map(({ installableName, version, majorVersion, platform, platformPath }) => ({
        installableName,
        version,
        majorVersion,
        platform,
        executablePath: this.getExecutablePath({ installableName, platform, installPath: platformPath }),
      })),
      async (value) =>
        fs.promises
          .stat(value.executablePath)
          .then((stat) => stat.isFile())
          .catch(() => false),
    );
    const withExecutablePaths = withExecutablePathss //
      .flat()
      .sort((lhs, rhs) => {
        const lhsVersion = geckodriverVersionUtils.parse(lhs.version);
        const rhsVersion = geckodriverVersionUtils.parse(rhs.version);
        return geckodriverVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
      });

    return withExecutablePaths;
  }

  getInstallPath(options: GetInstallPathOptions): string {
    const { installableName, version, platform, rootPath } = options;
    const installPath = path.resolve(rootPath, installableName, version, platform);
    return installPath;
  }

  getExecutablePath(options: GetExecutablePathOptions): string {
    const { installableName, platform, installPath } = options;
    const relativeExecutablePath = executablePathMap[installableName][platform];
    const executablePath = path.resolve(installPath, ...relativeExecutablePath);
    return executablePath;
  }

  getGeckodriverInstallablePlatform(options?: GetGeckodriverInstallablePlatformOptions): GeckodriverInstallablePlatform {
    const mergedOptions = mergeGetGeckodriverInstallablePlatformOptions(options);
    const { platform, arch } = mergedOptions;
    const geckodriverPlatform = _.get(platformMap, [platform, arch]) as string | undefined;
    if (!geckodriverPlatform) {
      throw new Error(`Unsupported platform: ${platform} ${arch}`);
    }

    if (!isValidGeckodriverInstallablePlatform(geckodriverPlatform)) {
      throw new Error(`Invalid platform: ${geckodriverPlatform}`);
    }

    return geckodriverPlatform;
  }
}
