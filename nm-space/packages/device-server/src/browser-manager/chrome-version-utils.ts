import { stringify } from '@dogu-tech/common';
import { VersionUtils } from './common';

export interface ChromeVersion {
  major: number;
  minor?: number;
  build?: number;
  patch?: number;
}

export class ChromeVersionUtils implements VersionUtils<ChromeVersion> {
  /**
   * @example
   * 116.0.5845.163
   */
  static readonly pattern = /^(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<build>\d+))?(?:\.(?<patch>\d+))?$/;

  parse(version: string): ChromeVersion {
    const pattern = ChromeVersionUtils.pattern;
    const match = version.match(pattern);
    if (!match) {
      throw new Error(`Chrome version [${version}] does not match pattern [${stringify(pattern)}]`);
    }

    if (!match.groups) {
      throw new Error(`Chrome version [${version}] does not have groups [${stringify(match)}]`);
    }

    const { major, minor, build, patch } = match.groups as Record<string, string | undefined>;
    if (major === undefined) {
      throw new Error(`Chrome version [${version}] does not have a major version`);
    }

    const majorNumber = parseInt(major);
    if (Number.isNaN(majorNumber)) {
      throw new Error(`Chrome version [${version}] has a major version that is not a number`);
    }

    const minorNumber = minor !== undefined ? parseInt(minor) : undefined;
    if (minor !== undefined && Number.isNaN(minorNumber)) {
      throw new Error(`Chrome version [${version}] has a minor version that is not a number`);
    }

    const buildNumber = build !== undefined ? parseInt(build) : undefined;
    if (build !== undefined && Number.isNaN(buildNumber)) {
      throw new Error(`Chrome version [${version}] has a build version that is not a number`);
    }

    const patchNumber = patch !== undefined ? parseInt(patch) : undefined;
    if (patch !== undefined && Number.isNaN(patchNumber)) {
      throw new Error(`Chrome version [${version}] has a patch version that is not a number`);
    }

    return {
      major: majorNumber,
      minor: minorNumber,
      build: buildNumber,
      patch: patchNumber,
    };
  }

  compareWithAsc(lhs: ChromeVersion, rhs: ChromeVersion): number {
    if (lhs.major !== rhs.major) {
      return lhs.major - rhs.major;
    } else if (lhs.minor !== rhs.minor) {
      return (lhs.minor || 0) - (rhs.minor || 0);
    } else if (lhs.build !== rhs.build) {
      return (lhs.build || 0) - (rhs.build || 0);
    } else if (lhs.patch !== rhs.patch) {
      return (lhs.patch || 0) - (rhs.patch || 0);
    } else {
      return 0;
    }
  }

  compareWithDesc(lhs: ChromeVersion, rhs: ChromeVersion): number {
    return this.compareWithAsc(rhs, lhs);
  }

  toString(version: ChromeVersion): string {
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
}

export const chromeVersionUtils = new ChromeVersionUtils();
