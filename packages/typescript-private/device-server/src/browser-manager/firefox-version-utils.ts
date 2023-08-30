import { PromiseOrValue, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import axios, { AxiosInstance } from 'axios';
import _ from 'lodash';

const client = axios.create();
setAxiosErrorFilterToIntercepter(client);

export abstract class VersionUtils<T> {
  abstract parse(version: string): T | Error;
  abstract compareWithAsc(lhs: T, rhs: T): number;
  abstract compareWithDesc(lhs: T, rhs: T): number;
  abstract toString(version: T): string;
  abstract latest(): PromiseOrValue<T>;
}

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

export class FirefoxVersionUtils extends VersionUtils<FirefoxVersion> {
  static readonly pattern = /^(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?(?:(?<preid>[a-z]+)(?<prerelease>\d+))?$/;
  static readonly firefoxVersionsUrl = 'https://product-details.mozilla.org/1.0/firefox_versions.json';

  private readonly httpClient: AxiosInstance;
  private lastEtag: string | undefined;
  private lastLatest: FirefoxVersion | undefined;

  constructor() {
    super();
    const httpClient = axios.create();
    setAxiosErrorFilterToIntercepter(httpClient);
    this.httpClient = httpClient;
  }

  parse(version: string): FirefoxVersion {
    const match = version.match(FirefoxVersionUtils.pattern);
    if (!match) {
      throw new Error(`Firefox version [${version}] does not match pattern [${stringify(FirefoxVersionUtils.pattern)}]`);
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
    const versionParts = [String(major), '.', String(minor)];
    if (patch !== undefined) {
      versionParts.push('.');
      versionParts.push(String(patch));
    }

    if (preid !== undefined && prerelease !== undefined) {
      versionParts.push(preid);
      versionParts.push(String(prerelease));
    }

    return versionParts.join('');
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
    const response = await this.httpClient.get(FirefoxVersionUtils.firefoxVersionsUrl);
    const etag = _.get(response.headers, 'etag') as string | undefined;
    const latestString = _.get(response.data, 'LATEST_FIREFOX_VERSION') as string | undefined;
    if (latestString === undefined) {
      throw new Error(`Failed to get latest Firefox version from ${FirefoxVersionUtils.firefoxVersionsUrl}`);
    }

    const latest = this.parse(latestString);
    return { etag, latest };
  }

  private async headFirefoxVersionsUrl(): Promise<HeadFirefoxVersionsUrlResult> {
    const response = await this.httpClient.head(FirefoxVersionUtils.firefoxVersionsUrl);
    const etag = _.get(response.headers, 'etag') as string | undefined;
    return { etag };
  }
}
