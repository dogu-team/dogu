import { AxiosInstance } from 'axios';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends Record<keyof any, unknown> | unknown[] ? DeepReadonly<T[K]> : T[K];
};

export interface VersionUtils<T> {
  parse(version: string): T;
  compareWithAsc(lhs: T, rhs: T): number;
  compareWithDesc(lhs: T, rhs: T): number;
  toString(version: T): string;
}

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

export interface InstallableNameWithin<InstallableName extends string> {
  /**
   * @description Installable name
   */
  installableName: InstallableName;
}

export interface ChannelNameWithin<InstallableName extends string> {
  /**
   * @description Channel name
   */
  channelName: InstallableName;
}

export interface DownloadOptions extends DownloadRequestTimeoutWithin {
  client: AxiosInstance;
  url: string;
  filePath: string;
}

export async function download(options: DownloadOptions): Promise<void> {
  const mergedOptions = _.merge(defaultDownloadRequestTimeoutWithin(), options);
  const { client, url, filePath, timeout } = mergedOptions;
  const response = await client.get(url, {
    timeout,
    responseType: 'stream',
  });
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  const writer = fs.createWriteStream(filePath);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  response.data.pipe(writer);
  await new Promise<void>((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
