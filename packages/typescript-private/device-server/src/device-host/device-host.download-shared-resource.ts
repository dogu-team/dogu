import { DefaultHttpOptions, Instance, setAxiosErrorFilterToGlobal } from '@dogu-tech/common';
import { DeviceHostDownloadSharedResource } from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import AsyncLock from 'async-lock';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import stream, { Stream } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { DoguLogger } from '../logger/logger';

export type DeviceHostDownloadResult = Instance<typeof DeviceHostDownloadSharedResource.receiveMessage> & { message: string };
export type DeviceHostDownloadParam = Instance<typeof DeviceHostDownloadSharedResource.sendMessage>;

@Injectable()
export class DeviceHostDownloadSharedResourceService {
  constructor(private readonly logger: DoguLogger) {}
  private downloadLockAndQ = new AsyncLock();

  public async queueDownload(message: DeviceHostDownloadParam): Promise<DeviceHostDownloadResult> {
    const result = await this.downloadLockAndQ.acquire(
      message.filePath,
      async () => {
        return await this.download(message);
      },
      {
        timeout: DefaultHttpOptions.request.timeout30minutes,
        maxOccupationTime: DefaultHttpOptions.request.timeout30minutes,
      },
    );
    return result;
  }

  private async download(message: DeviceHostDownloadParam): Promise<DeviceHostDownloadResult> {
    const { filePath, url, expectedFileSize, headers } = message;
    const stat = await fs.promises.stat(filePath).catch(() => null);
    if (stat !== null) {
      if (stat.isFile()) {
        this.logger.info('File already exists', { filePath });
        this.logger.info(`File size local: ${stat.size} expected: ${expectedFileSize}`, { filePath });
        if (stat.size === expectedFileSize) {
          this.logger.info('File is same size. Skipping download', { filePath });
          return {
            responseCode: 200,
            responseHeaders: {},
            message: 'File already exists',
          };
        } else {
          this.logger.info('File is not same size. Deleting file', { filePath });
          await fs.promises.unlink(filePath);
          this.logger.info('File deleted', { filePath });
        }
      } else {
        this.logger.error('File is not a file', { filePath });
        throw new Error('File is not a file');
      }
    }

    this.logger.info('File is downloading', { filePath });
    const tempFileName = `${uuidv4()}.download`;
    const tempFilePath = path.resolve(HostPaths.doguTempPath(), tempFileName);
    if (!fs.existsSync(HostPaths.doguTempPath())) {
      fs.mkdirSync(HostPaths.doguTempPath(), { recursive: true });
    }
    setAxiosErrorFilterToGlobal();
    const response = await axios.get(url, {
      responseType: 'stream',
      headers,
      timeout: DefaultHttpOptions.request.timeout,
    });
    if (!(response.data instanceof Stream)) {
      throw new Error('response.data is not stream');
    }
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);
    try {
      await stream.promises.finished(writer);
    } catch (error) {
      writer.close();
      throw error;
    }
    const dirPath = path.dirname(filePath);
    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.rename(tempFilePath, filePath);
    this.logger.info('File downloaded', { filePath });
    const responseHeaders = Reflect.ownKeys(response.headers).reduce((acc, key) => {
      const value = Reflect.get(response.headers, key);
      if (Array.isArray(value)) {
        Reflect.set(acc, key, value.join(','));
      } else {
        Reflect.set(acc, key, String(value));
      }
      return acc;
    }, {} as Record<string, string>);

    return {
      responseCode: response.status,
      responseHeaders,
      message: 'File downloaded',
    };
  }
}
