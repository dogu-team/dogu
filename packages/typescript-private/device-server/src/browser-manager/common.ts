export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends Record<keyof any, unknown> | unknown[] ? DeepReadonly<T[K]> : T[K];
};

export interface VersionRequestTimeoutWithin {
  /**
   * @description Request timeout in milliseconds
   * @default 30_000
   */
  timeout?: number;
}

export function defaultVersionRequestTimeoutWithin(): Required<VersionRequestTimeoutWithin> {
  return {
    timeout: 30_000,
  };
}

export interface PrefixOrPatternWithin {
  /**
   * @description Prefix of version
   * @note Only one of the `prefix` or `pattern` must be defined
   */
  prefix?: string;

  /**
   * @description Pattern of version
   * @note Only one of the `prefix` or `pattern` must be defined
   */
  pattern?: RegExp;
}

export function validatePrefixOrPatternWithin(options: PrefixOrPatternWithin): void {
  const { prefix, pattern } = options;
  if (!prefix && !pattern) {
    throw new Error('Either prefix or pattern must be defined');
  }

  if (prefix && pattern) {
    throw new Error('Only one of the `prefix` or `pattern` must be defined');
  }
}

export interface RootPathWithin {
  /**
   * @description Install root path. installable will be installed to `<rootPath>/<installableName>/<version>/<platform>/<arch>`
   * @default process.cwd()
   */
  rootPath?: string;
}

export function defaultRootPathWithin(): Required<RootPathWithin> {
  return {
    rootPath: process.cwd(),
  };
}

export interface DownloadRequestTimeoutWithin {
  /**
   * @description Request timeout in milliseconds
   * @default 10 * 60_000
   */
  timeout?: number;
}

export function defaultDownloadRequestTimeoutWithin(): Required<DownloadRequestTimeoutWithin> {
  return {
    timeout: 10 * 60_000,
  };
}

export interface VersionWithin {
  /**
   * @description Version
   */
  version: string;
}

export interface PlatformWithin {
  /**
   * @description Node.js platform
   * @default process.platform
   */
  platform?: NodeJS.Platform;
}

export function defaultPlatformWithin(): Required<PlatformWithin> {
  return {
    platform: process.platform,
  };
}

export interface ArchWithin {
  /**
   * @description Node.js architecture
   * @default process.arch
   */
  arch?: NodeJS.Architecture;
}

export function defaultArchWithin(): Required<ArchWithin> {
  return {
    arch: process.arch,
  };
}
