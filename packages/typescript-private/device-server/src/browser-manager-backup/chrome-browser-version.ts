import { setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import axios from 'axios';
import _ from 'lodash';

export const ChromeVersionPattern = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?$/;
export const ChromeKnownGoodVersionsUrl = 'https://googlechromelabs.github.io/chrome-for-testing/known-good-versions.json';
export const ChromeLastKnownGoodVersionsUrl = 'https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json';

const client = axios.create();
setAxiosErrorFilterToIntercepter(client);

export interface ChromeVersionLike {
  major?: number;
  minor?: number;
  build?: number;
  patch?: number;
}

export function parseChromeVersionLike(version: string): ChromeVersionLike {
  const match = version.match(ChromeVersionPattern);
  if (match) {
    const [_, major, minor, build, patch] = match;
    return {
      major: major ? parseInt(major, 10) : undefined,
      minor: minor ? parseInt(minor, 10) : undefined,
      build: build ? parseInt(build, 10) : undefined,
      patch: patch ? parseInt(patch, 10) : undefined,
    };
  }
  return {
    major: undefined,
    minor: undefined,
    build: undefined,
    patch: undefined,
  };
}

export function chromeVersionLikeToString(version: ChromeVersionLike): string {
  const { major, minor, build, patch } = version;
  if (major === undefined) {
    return '';
  }

  if (minor === undefined) {
    return `${major}`;
  }

  if (build === undefined) {
    return `${major}.${minor}`;
  }

  if (patch === undefined) {
    return `${major}.${minor}.${build}`;
  }

  return `${major}.${minor}.${build}.${patch}`;
}

export function compareChromeVersionLike(lhs: ChromeVersionLike, rhs: ChromeVersionLike, order: 'asc' | 'desc' = 'asc'): number {
  const factor = order === 'asc' ? 1 : -1;
  const defaultValue = 0;
  const lhsWithDefault: Required<ChromeVersionLike> = {
    major: lhs.major || defaultValue,
    minor: lhs.minor || defaultValue,
    build: lhs.build || defaultValue,
    patch: lhs.patch || defaultValue,
  };
  const rhsWithDefault: Required<ChromeVersionLike> = {
    major: rhs.major || defaultValue,
    minor: rhs.minor || defaultValue,
    build: rhs.build || defaultValue,
    patch: rhs.patch || defaultValue,
  };
  if (lhsWithDefault.major !== rhsWithDefault.major) {
    return factor * (lhsWithDefault.major - rhsWithDefault.major);
  } else if (lhsWithDefault.minor !== rhsWithDefault.minor) {
    return factor * (lhsWithDefault.minor - rhsWithDefault.minor);
  } else if (lhsWithDefault.build !== rhsWithDefault.build) {
    return factor * (lhsWithDefault.build - rhsWithDefault.build);
  } else if (lhsWithDefault.patch !== rhsWithDefault.patch) {
    return factor * (lhsWithDefault.patch - rhsWithDefault.patch);
  } else {
    return 0;
  }
}

export function findChromeVersionLike(toMatch: ChromeVersionLike, targerts: Required<ChromeVersionLike>[]): Required<ChromeVersionLike> | undefined {
  if (toMatch.major !== undefined && toMatch.minor !== undefined && toMatch.build !== undefined && toMatch.patch !== undefined) {
    return targerts.find((version) => version.major === toMatch.major && version.minor === toMatch.minor && version.build === toMatch.build && version.patch === toMatch.patch);
  } else if (toMatch.major !== undefined && toMatch.minor !== undefined && toMatch.build !== undefined) {
    return targerts.find((version) => version.major === toMatch.major && version.minor === toMatch.minor && version.build === toMatch.build);
  } else if (toMatch.major !== undefined && toMatch.minor !== undefined) {
    return targerts.find((version) => version.major === toMatch.major && version.minor === toMatch.minor);
  } else if (toMatch.major !== undefined) {
    return targerts.find((version) => version.major === toMatch.major);
  } else {
    return undefined;
  }
}

export async function downloadKnownGoodChromeVersionLikes(): Promise<Required<ChromeVersionLike>[]> {
  const response = await client.get(ChromeKnownGoodVersionsUrl).catch((error) => {
    throw new Error(`Failed to download ${ChromeKnownGoodVersionsUrl}: ${stringify(error)}`);
  });
  const versionObjects = _.get(response.data, 'versions') as { version?: string; revision?: string }[] | undefined;
  const knownGoodVersionLikes = versionObjects
    ?.map((versionObject) => {
      const version = _.get(versionObject, 'version');
      if (version) {
        return parseChromeVersionLike(version);
      }
      return undefined;
    })
    .filter((version) => version !== undefined) as Required<ChromeVersionLike>[];
  return knownGoodVersionLikes;
}

export async function downloadLastKnownGoodChromeVersionLike(): Promise<Required<ChromeVersionLike>> {
  const response = await client.get(ChromeLastKnownGoodVersionsUrl).catch((error) => {
    throw new Error(`Failed to download ${ChromeKnownGoodVersionsUrl}: ${stringify(error)}`);
  });
  const version = _.get(response.data, 'channels.Stable.version') as string | undefined;
  if (!version) {
    throw new Error(`Failed to download ${ChromeLastKnownGoodVersionsUrl}: version is not found`);
  }
  const parsed = parseChromeVersionLike(version);
  if (parsed.major === undefined || parsed.minor === undefined || parsed.build === undefined || parsed.patch === undefined) {
    throw new Error(`Failed to download ${ChromeLastKnownGoodVersionsUrl}: version is invalid`);
  }
  return parsed as Required<ChromeVersionLike>;
}
