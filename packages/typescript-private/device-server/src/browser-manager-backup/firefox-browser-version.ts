import { setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import axios, { AxiosInstance } from 'axios';
import _ from 'lodash';
import { BrowserVersionProvider, BrowserVersionUtils } from './browser-manager.types';

export interface FirefoxVersion {
  major: number;
  minor: number;
  patch?: number;
  preid?: string;
  prerelease?: number;
}

export interface HeadFirefoxVersionsUrlResult {
  etag: string | undefined;
}

export interface GetFirefoxVersionsUrlResult {
  etag: string | undefined;
  latest: FirefoxVersion;
}

export class FirefoxBrowserVersionProvider implements BrowserVersionProvider<FirefoxVersion> {
  static readonly versionPattern = /^(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?(?:(?<preid>[a-z]+)(?<prerelease>\d+))?$/;
  static readonly firefoxVersionsUrl = 'https://product-details.mozilla.org/1.0/firefox_versions.json';

  private readonly httpClient: AxiosInstance;
  private lastEtag: string | undefined;
  private lastLatest: FirefoxVersion | undefined;

  constructor() {
    const httpClient = axios.create();
    setAxiosErrorFilterToIntercepter(httpClient);
    this.httpClient = httpClient;
  }

  async latest(): Promise<FirefoxVersion> {
    if (this.lastLatest) {
      const headFirefoxVersionsUrlResult = await this.headFirefoxVersionsUrl();
      if (headFirefoxVersionsUrlResult.etag === this.lastEtag) {
        return this.lastLatest;
      }
    }

    const getFirefoxVersionsUrlResult = await this.getFirefoxVersionsUrl();
    this.lastEtag = getFirefoxVersionsUrlResult.etag;
    this.lastLatest = getFirefoxVersionsUrlResult.latest;
    return this.lastLatest;
  }

  private async getFirefoxVersionsUrl(): Promise<GetFirefoxVersionsUrlResult> {
    const firefoxVersionsUrl = FirefoxBrowserVersionProvider.firefoxVersionsUrl;
    const response = await this.httpClient.get(firefoxVersionsUrl);
    const etag = _.get(response.headers, 'etag') as string | undefined;
    const latestString = _.get(response.data, 'LATEST_FIREFOX_VERSION') as string | undefined;
    if (latestString === undefined) {
      throw new Error(`Failed to get latest Firefox version from ${firefoxVersionsUrl}`);
    }

    const latest = firefoxBrowserVersionUtils.parse(latestString);
    return { etag, latest };
  }

  private async headFirefoxVersionsUrl(): Promise<HeadFirefoxVersionsUrlResult> {
    const firefoxVersionsUrl = FirefoxBrowserVersionProvider.firefoxVersionsUrl;
    const response = await this.httpClient.head(firefoxVersionsUrl);
    const etag = _.get(response.headers, 'etag') as string | undefined;
    return { etag };
  }
}

export class FirefoxBrowserVersionUtils implements BrowserVersionUtils<FirefoxVersion> {
  parse(version: string): FirefoxVersion {
    const pattern = FirefoxBrowserVersionProvider.versionPattern;
    const match = version.match(pattern);
    if (!match) {
      throw new Error(`Firefox version [${version}] does not match pattern [${stringify(pattern)}]`);
    }

    if (!match.groups) {
      throw new Error(`Firefox version [${version}] does not have groups [${stringify(match)}]`);
    }

    const { major, minor, patch, preid, prerelease } = match.groups as Record<string, string | undefined>;
    if (major === undefined) {
      throw new Error(`Firefox version [${version}] does not have a major version`);
    }

    const majorNumber = parseInt(major);
    if (Number.isNaN(majorNumber)) {
      throw new Error(`Firefox version [${version}] has a major version that is not a number`);
    }

    if (minor === undefined) {
      throw new Error(`Firefox version [${version}] does not have a minor version`);
    }

    const minorNumber = parseInt(minor);
    if (Number.isNaN(minorNumber)) {
      throw new Error(`Firefox version [${version}] has a minor version that is not a number`);
    }

    const patchNumber = patch !== undefined ? parseInt(patch) : undefined;
    if (patch !== undefined && Number.isNaN(patchNumber)) {
      throw new Error(`Firefox version [${version}] has a patch version that is not a number`);
    }

    const prereleaseNumber = prerelease !== undefined ? parseInt(prerelease) : undefined;
    if (prerelease !== undefined && Number.isNaN(prereleaseNumber)) {
      throw new Error(`Firefox version [${version}] has a prerelease version that is not a number`);
    }

    return {
      major: majorNumber,
      minor: minorNumber,
      patch: patchNumber !== undefined ? patchNumber : undefined,
      preid,
      prerelease: prereleaseNumber !== undefined ? prereleaseNumber : undefined,
    };
  }

  compareWithAsc(lhs: FirefoxVersion, rhs: FirefoxVersion): number {
    if (lhs.major !== rhs.major) {
      return lhs.major - rhs.major;
    }

    if (lhs.minor !== rhs.minor) {
      return lhs.minor - rhs.minor;
    }

    if (lhs.patch !== undefined && rhs.patch !== undefined) {
      if (lhs.patch !== rhs.patch) {
        return lhs.patch - rhs.patch;
      }
    } else if (lhs.patch !== undefined) {
      return 1;
    } else if (rhs.patch !== undefined) {
      return -1;
    }

    if (lhs.preid !== undefined && rhs.preid !== undefined) {
      if (lhs.preid !== rhs.preid) {
        return lhs.preid.localeCompare(rhs.preid);
      }
    } else if (lhs.preid !== undefined) {
      return 1;
    } else if (rhs.preid !== undefined) {
      return -1;
    }

    if (lhs.prerelease !== undefined && rhs.prerelease !== undefined) {
      if (lhs.prerelease !== rhs.prerelease) {
        return lhs.prerelease - rhs.prerelease;
      }
    } else if (lhs.prerelease !== undefined) {
      return 1;
    } else if (rhs.prerelease !== undefined) {
      return -1;
    }

    return 0;
  }

  compareWithDesc(lhs: FirefoxVersion, rhs: FirefoxVersion): number {
    return this.compareWithAsc(rhs, lhs);
  }

  toString(version: FirefoxVersion): string {
    const { major, minor, patch, preid, prerelease } = version;
    if (patch === undefined) {
      return `${major}.${minor}`;
    }

    if (preid === undefined && prerelease === undefined) {
      return `${major}.${minor}.${patch}`;
    }

    if (preid !== undefined && prerelease !== undefined) {
      return `${major}.${minor}.${patch}${preid}${prerelease}`;
    }

    throw new Error(`Invalid firefox version to string: [${stringify(version)}]`);
  }
}

export const firefoxBrowserVersionUtils = new FirefoxBrowserVersionUtils();
