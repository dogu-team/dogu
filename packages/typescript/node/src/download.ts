import { Printable, setAxiosErrorFilterToIntercepter, stringify } from '@dogu-tech/common';
import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';

interface Headers {
  [key: string]: string;
}

/**
 * @description Timeout for download request
 * @unit milliseconds
 */
export type DownloadRequestTimeout = number;
export const defaultDownloadRequestTimeout = (): DownloadRequestTimeout => 10 * 60_000;

export interface DownloadProgress {
  percent: number;
  transferredBytes: number;
  totalBytes: number;
}

export interface DownloadOptions {
  url: string;
  filePath: string;

  /**
   * @description axios instance for download request. if not specified, default instance is used.
   */
  client?: AxiosInstance;

  /**
   * @description Timeout for download request
   * @unit milliseconds
   * @default 10 * 60_000
   */
  timeout?: DownloadRequestTimeout;
  headers?: Headers;
  logger?: Printable | null;
  onProgress?: (progress: DownloadProgress) => void | null;
}

const defaultClient = axios.create();
setAxiosErrorFilterToIntercepter(defaultClient);

function mergeDownloadOptions(options: DownloadOptions): Required<DownloadOptions> {
  return _.merge(
    {
      client: defaultClient,
      timeout: defaultDownloadRequestTimeout(),
      headers: {},
      logger: null,
      onProgress: null,
    },
    options,
  );
}

export async function download(options: DownloadOptions): Promise<void> {
  const mergedOptions = mergeDownloadOptions(options);
  const { client, url, filePath, timeout, headers, logger, onProgress } = mergedOptions;
  logger?.verbose?.('download start', { url, filePath });
  const response = await client.get(url, {
    timeout,
    responseType: 'stream',
    headers,
  });

  const responseContentLength = response.headers['content-length'] ? Number(response.headers['content-length']) : 0;
  logger?.verbose?.('download response', { url, filePath, responseContentLength });

  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  const writer = fs.createWriteStream(filePath);
  const reader = response.data as NodeJS.ReadableStream;
  reader.pipe(writer);

  const totalBytes = responseContentLength;
  let transferredBytes = 0;
  reader.on('data', (data: Buffer) => {
    transferredBytes += data.length;
    const percent = Math.floor((transferredBytes * 100) / totalBytes);
    onProgress?.({ percent, transferredBytes, totalBytes });
  });

  await new Promise<void>((resolve, reject) => {
    writer.on('finish', () => {
      logger?.verbose?.('download finish', { url, filePath });
      if (response.status !== 200) {
        logger?.error('download failed', { url, filePath, status: response.status });
        reject(new Error(`download failed. url:${url}, filePath:${filePath}, status:${stringify(response.status)}`));
        return;
      }

      const responseContentLength = response.headers['content-length'] ? Number(response.headers['content-length']) : 0;
      const fileSize = fs.statSync(filePath).size;
      if (0 < responseContentLength && responseContentLength !== fileSize) {
        logger?.error('download failed', { url, filePath, responseContentLength, fileSize });
        reject(new Error(`download failed. url:${url}, filePath:${filePath}, responseContentLength:${responseContentLength}, fileSize:${fileSize}`));
        return;
      }

      resolve();
    });

    writer.on('error', (error) => {
      logger?.error(error);
      reject(error);
    });
  });
}
