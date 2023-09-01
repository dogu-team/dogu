import { isFilteredAxiosError, PrefixLogger, setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import AsyncLock from 'async-lock';
import axios, { AxiosInstance, isAxiosError } from 'axios';
import _ from 'lodash';
import { logger } from '../logger/logger.instance';
import { DeepReadonly } from './common';

export interface WebCacheOptions {
  /**
   * @description Name of cache
   */
  name: string;

  /**
   * @description URL to get data
   */
  url: string;

  /**
   * @description Request timeout in milliseconds
   * @default 60_000
   */
  defaultTimeout?: number;

  /**
   * @description Axios instance
   */
  client?: AxiosInstance;
}

export interface WebCacheGetOptions {
  /**
   * @description Request timeout in milliseconds
   * @note default is `defaultTimeout` in `WebCacheOptions`
   */
  timeout?: number;
}

export class WebCache<T> {
  private readonly writeLock = new AsyncLock();
  private readonly logger: PrefixLogger;
  private readonly url: string;
  private readonly defaultTimeout: number;
  private readonly client: AxiosInstance;
  private etag: string | undefined;
  private data: T | undefined;

  constructor(options: WebCacheOptions) {
    this.logger = new PrefixLogger(logger, `[${options.name}]`);
    this.url = options.url;
    this.defaultTimeout = options.defaultTimeout ?? 60_000;
    const client =
      options.client ??
      ((): AxiosInstance => {
        const client = axios.create();
        setAxiosErrorFilterToIntercepter(client);
        return client;
      })();
    this.client = client;
  }

  async get(options?: WebCacheGetOptions): Promise<DeepReadonly<T>> {
    const data = await this.writeLock.acquire(this.get.name, async () => {
      try {
        const response = await this.client.get<T>(this.url, {
          timeout: options?.timeout ?? this.defaultTimeout,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'If-None-Match': this.etag,
          },
        });

        const { data } = response;
        const etag = _.get(response.headers, 'etag') as string | undefined;
        if (etag) {
          this.etag = etag;
          this.data = data;
        }

        this.logger.info(`Got data from web of etag: ${etag ?? 'undefined'}`);
        return data;
      } catch (error) {
        const isCached = (isAxiosError(error) && error.response?.status === 304) || (isFilteredAxiosError(error) && error.responseStatus === 304);
        if (isCached) {
          if (!this.data) {
            throw new Error(`Invalid cache of ${this.url}`);
          }

          this.logger.info(`Got data from cache of etag: ${this.etag ?? 'undefined'}`);
          return this.data;
        }

        throw error;
      }
    });
    return data;
  }
}
