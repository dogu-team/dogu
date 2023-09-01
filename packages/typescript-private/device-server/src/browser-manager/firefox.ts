import { BrowserOrDriverName } from '@dogu-private/types';
import { PrefixLogger, setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import AsyncLock from 'async-lock';
import axios, { AxiosInstance } from 'axios';
import _ from 'lodash';
import { logger } from '../logger/logger.instance';
import {
  ArchWithin,
  DeepReadonly,
  defaultDownloadRequestTimeoutWithin,
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

export type InstallableName = Extract<BrowserOrDriverName, 'firefox' | 'geckodriver'>;

interface InstallableNameWithin {
  /**
   * @description Installable name
   */
  installableName: InstallableName;
}

export type ChannelName = 'firefox' | 'devedition';

interface ChannelNameWithin {
  /**
   * @description Channel name
   * @default 'firefox'
   */
  channelName: ChannelName;
}

function defaultChannelNameWithin(): Required<ChannelNameWithin> {
  return {
    channelName: 'firefox',
  };
}

export type GetLatestVersionOptions = ChannelNameWithin & VersionRequestTimeoutWithin;
export type FindVersionOptions = ChannelNameWithin & PrefixOrPatternWithin & VersionRequestTimeoutWithin;
export type InstallOptions = RootPathWithin & InstallableNameWithin & VersionWithin & ChannelNameWithin & DownloadRequestTimeoutWithin;
export type GetInstallPathOptions = RootPathWithin & InstallableNameWithin & VersionWithin & PlatformWithin & ArchWithin;

export class Firefox {
  static readonly latestVersionMap: DeepReadonly<Record<ChannelName, keyof DetailsFirefoxVersions>> = {
    firefox: 'LATEST_FIREFOX_VERSION',
    devedition: 'LATEST_FIREFOX_DEVEL_VERSION',
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

  async getLatestVersion(options?: GetLatestVersionOptions): Promise<string> {
    const mergedOptions = _.merge(defaultChannelNameWithin(), defaultVersionRequestTimeoutWithin(), options);
    const { channelName, timeout } = mergedOptions;
    const details = await this.detailsFirefoxVersionsCache.get({ timeout });
    const version = details[Firefox.latestVersionMap[channelName]];
    return version;
  }

  async findVersion(options?: FindVersionOptions): Promise<string | undefined> {
    const mergedOptions = _.merge(defaultChannelNameWithin(), defaultVersionRequestTimeoutWithin(), options);
    validatePrefixOrPatternWithin(mergedOptions);

    const { channelName, timeout, prefix, pattern } = mergedOptions;
    const details = channelName === 'firefox' ? await this.detailsFirefoxCache.get({ timeout }) : await this.detailsDeveditionCache.get({ timeout });

    const versions = Object.keys(details.releases).map((version) => version.replace(`${channelName}-`, ''));
    const reversedVersions = versions.reverse();
    if (prefix) {
      const version = reversedVersions.find((version) => version.startsWith(prefix));
      return version;
    }

    if (pattern) {
      const version = reversedVersions.find((version) => pattern.test(version));
      return version;
    }

    throw new Error('Unexpected find version process');
  }

  async install(options: InstallOptions): Promise<InstallResult> {
    const mergedOptions = _.merge(defaultRootPathWithin(), defaultChannelNameWithin(), defaultDownloadRequestTimeoutWithin(), options);
    const { rootPath, installableName, version, channelName, timeout } = mergedOptions;
    const installPath = this.getInstallPath({ rootPath, installableName, version, channelName });
  }

  getInstallPath(options: GetInstallPathOptions): string {}
}
