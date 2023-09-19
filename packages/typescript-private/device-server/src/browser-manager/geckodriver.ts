import { BrowserOrDriverName, BrowserVersion } from '@dogu-private/types';
import { assertUnreachable, DeepReadonly, errorify, PrefixLogger } from '@dogu-tech/common';
import { defaultDownloadRequestTimeout, OctokitContext } from '@dogu-tech/node';
import { logger } from '../logger/logger.instance';
import { defaultVersionRequestTimeout } from './common';
import path from 'path';
import AsyncLock from 'async-lock';
import fs from 'fs';
import compressing from 'compressing';
import { chromeVersionUtils } from './chrome-version-utils';
import _ from 'lodash';

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
      case 'geckodriver': {
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
        this.logger.error('Failed to download release asset', {error: errorify(error)});
        throw error;
      } finally {
        try {
          if (await fs.promises.stat(downloadFilePath).catch(() => false)) {
            await fs.promises.rm(downloadFilePath, { recursive: true, force: true });
          }  
        } catch (error) {
          this.logger.error('Failed to remove download file', {error: errorify(error)});
        }
      }
    });
  }

  async findInstallations(options: FindInstallationsOptions): Promise<FindInstallationsResult> {
    const { installableName, platform: requestedPlatform, rootPath } = options;
    const installableNames: GeckodriverInstallableName[] = ['geckodriver'];
    const withInstallablePaths = installableNames.filter((name) => name === installableName).map((installableName) => ({
      installableName,
      installablePath: path.resolve(rootPath, installableName),
    }));
    const withInstallablePathExists = await Promise.all(withInstallablePaths.map(async ({ installableName, installablePath }) => ({
      installableName,
      installablePath,
      installablePathExist: await fs.promises.stat(installablePath).then((stat) => stat.isDirectory()).catch(() => false),
    })));
    const withInstallablePathResults = withInstallablePathExists.filter(({ installablePathExist }) => installablePathExist)
    .map(({ installableName, installablePath }) => ({
      installableName,
      installablePath,
    }));
    const withVersionss = await Promise.all(withInstallablePathResults.map(async ({ installableName, installablePath }) => {
      const versions = await fs.promises.readdir(installablePath);
      return versions.map((version) => {
        try {
          const parsed = geckodriverVersionUtils.parse(version);
          return {
            installableName,
            installablePath,
            version,
            majorVersion: parsed.major,
          };
          } catch (error) {
            this.logger.warn('Failed to parse version', { error: errorify(error) });
            return null;
          }
        }).filter((result): result is NonNullable<typeof result> => !!result);
    }));
    const withVersions = withVersionss.flat();
    const withVersionPaths = withVersions.map(({ installableName, version, majorVersion, installablePath }) => ({
      installableName,
      version,
      majorVersion,
      versionPath: path.resolve(installablePath, version),
    }));
    const withVersionPathExists = await Promise.all(withVersionPaths.map(async ({ installableName, version, majorVersion, versionPath }) => ({
      installableName,
      version,
      majorVersion,
      versionPath,
      versionPathExist: await fs.promises.stat(versionPath).then((stat) => stat.isDirectory()).catch(() => false),
    })));
    const withVersionPathResults = withVersionPathExists.filter(({ versionPathExist }) => versionPathExist).map(({ installableName, version, majorVersion, versionPath }) => ({
      installableName,
      version,
      majorVersion,
      versionPath,
    }));
    const withPlatformss = await Promise.all(withVersionPathResults.map(async ({ installableName, version, majorVersion, versionPath }) => {
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
        .filter(({ platform }) => isValidGeckodriverInstallablePlatform(platform))
        .map(({ installableName, version, majorVersion, platform }) => ({
          installableName,
          version,
          majorVersion,
          platform: platform as GeckodriverInstallablePlatform,
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
    const withPlatformPathExists = await Promise.all(withPlatformPaths.map(async ({ installableName, version, majorVersion, platform, platformPath }) => ({
      installableName,
      version,
      majorVersion,
      platform,
      platformPath,
      platformPathExist: await fs.promises.stat(platformPath).then((stat) => stat.isDirectory()).catch(() => false),
    })));
    const withPlatformPathResults = withPlatformPathExists.filter(({ platformPathExist }) => platformPathExist).map(({ installableName, version, majorVersion, platform, platformPath }) => ({
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
      executablePath: this.getExecutablePath({ installableName, platform, installPath: platformPath }),
    }));
    const withExecutablePathExists = await Promise.all(withExecutablePaths.map(async ({ installableName, version, majorVersion, platform, executablePath }) => ({
      installableName,
      version,
      majorVersion,
      platform,
      executablePath,
      executablePathExist: await fs.promises.stat(executablePath).then((stat) => stat.isFile()).catch(() => false),
    })));
    const withExecutablePathResults = withExecutablePathExists.filter(({ executablePathExist }) => executablePathExist)
    .map(({ installableName, version, majorVersion, platform, executablePath }) => ({
      installableName,
      version,
      majorVersion,
      platform,
      executablePath,
    })).sort((lhs, rhs) => {
      const lhsVersion = geckodriverVersionUtils.parse(lhs.version);
      const rhsVersion = geckodriverVersionUtils.parse(rhs.version);
      return geckodriverVersionUtils.compareWithDesc(lhsVersion, rhsVersion);
    });
    return withExecutablePathResults;
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
