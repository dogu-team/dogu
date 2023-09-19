export interface VersionUtils<T> {
  parse(version: string): T;
  compareWithAsc(lhs: T, rhs: T): number;
  compareWithDesc(lhs: T, rhs: T): number;
  toString(version: T): string;
}

/**
 * @description Timeout for version request
 * @unit milliseconds
 */
export type VersionRequestTimeout = number;
export const defaultVersionRequestTimeout = (): VersionRequestTimeout => 30_000;

/**
 * @description Timeout for installation
 * @unit milliseconds
 */
export type InstallationTimeout = number;
export const defaultInstallationTimeout = (): InstallationTimeout => 10 * 60_000;

/**
 * @description Installation root path. each browser or driver is installed under `<installationRootPath>/<name>/<version>/<platform>`.
 * @default process.cwd()
 */
export type InstallationRootPath = string;
export const defaultInstallationRootPath = (): InstallationRootPath => process.cwd();

/**
 * @description version prefix for finding
 */
export type VersionPrefix = string;

/**
 * @description version pattern for finding
 */
export type VersionPattern = RegExp;

export function validatePrefixOrPatternWithin(options: { prefix?: VersionPrefix | null; pattern?: VersionPattern | null }): void {
  const { prefix, pattern } = options;
  if (!prefix && !pattern) {
    throw new Error('Either prefix or pattern must be defined');
  }

  if (prefix && pattern) {
    throw new Error('Only one of the `prefix` or `pattern` must be defined');
  }
}
