import { stringify } from '@dogu-tech/common';
import { VersionUtils } from './common';

export interface FirefoxVersion {
  major: number;
  minor: number;
  build?: number;
  patch?: number;
  preid?: string;
  prerelease?: number;
}

export class FirefoxVersionUtils implements VersionUtils<FirefoxVersion> {
  /**
   * @example
   * 117.0
   * 117.0.1
   * 117.0.1esr
   * 117.0.1a1
   * 117.0.1a2
   * 117.0.1b1
   * 117.0.1b2
   * 1.5.0.1
   */
  static readonly pattern = /^(?<major>\d+)\.(?<minor>\d+)(?:\.(?<build>\d+))?(?:\.(?<patch>\d+))?(?<preid>[a-z]+)?(?<prerelease>\d+)?$/;

  parse(version: string): FirefoxVersion {
    const pattern = FirefoxVersionUtils.pattern;
    const match = version.match(pattern);
    if (!match) {
      throw new Error(`Firefox version [${version}] does not match pattern [${stringify(pattern)}]`);
    }

    if (!match.groups) {
      throw new Error(`Firefox version [${version}] does not have groups [${stringify(match)}]`);
    }

    const { major, minor, build, patch, preid, prerelease } = match.groups as Record<string, string | undefined>;
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

    const buildNumber = build !== undefined ? parseInt(build) : undefined;
    if (build !== undefined && Number.isNaN(buildNumber)) {
      throw new Error(`Firefox version [${version}] has a build version that is not a number`);
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
      build: buildNumber !== undefined ? buildNumber : undefined,
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

    if (lhs.build !== undefined && rhs.build !== undefined && lhs.build !== rhs.build) {
      return lhs.build - rhs.build;
    }

    if (lhs.patch !== undefined && rhs.patch !== undefined && lhs.patch !== rhs.patch) {
      return lhs.patch - rhs.patch;
    }

    if (lhs.preid !== undefined && rhs.preid !== undefined && lhs.preid !== rhs.preid) {
      return lhs.preid.localeCompare(rhs.preid);
    }

    if (lhs.prerelease !== undefined && rhs.prerelease !== undefined && lhs.prerelease !== rhs.prerelease) {
      return lhs.prerelease - rhs.prerelease;
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

export const firefoxVersionUtils = new FirefoxVersionUtils();
