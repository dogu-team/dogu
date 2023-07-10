import { extensionFromPlatform, PlatformType } from '@dogu-private/types';
import { DefaultHttpOptions, stringify } from '@dogu-tech/common';
import { convertWebDriverPlatformToDogu, RelayRequest, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import stream, { Stream } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { AppiumRemoteContext } from '../appium/appium.remote.context';
import { DoguLogger } from '../logger/logger';

export interface DeviceWebDriverEndpointHandlerResultError {
  status: number;
  error: Error;
  data: Object;
}

export interface DeviceWebDriverEndpointHandlerResultOk {
  error?: undefined;
  request: RelayRequest;
}

export type DeviceWebDriverEndpointHandlerResult = DeviceWebDriverEndpointHandlerResultError | DeviceWebDriverEndpointHandlerResultOk;

export abstract class DeviceWebDriverEndpointHandler {
  abstract onRequest(remoteContext: AppiumRemoteContext, endpoint: WebDriverEndPoint, request: RelayRequest, logger: DoguLogger): Promise<DeviceWebDriverEndpointHandlerResult>;
}

export class DeviceWebDriverNewSessionEndpointHandler extends DeviceWebDriverEndpointHandler {
  async onRequest(remoteContext: AppiumRemoteContext, endpoint: WebDriverEndPoint, request: RelayRequest, logger: DoguLogger): Promise<DeviceWebDriverEndpointHandlerResult> {
    if (endpoint.info.type !== 'new-session') {
      return { status: 400, error: new Error('Internal error. endpoint type is not new-session'), data: {} };
    }
    if (!endpoint.info.capabilities.doguOptions.appUrl) {
      return { status: 400, error: new Error('App url not specified'), data: {} };
    }
    const platform = convertWebDriverPlatformToDogu(endpoint.info.capabilities.platformName);
    const url = endpoint.info.capabilities.doguOptions.appUrl;
    const filename = path.basename(url);
    const extension = getAppExtension(platform);
    const appVersion = endpoint.info.capabilities.doguOptions.appVersion;
    if (!appVersion) {
      return { status: 400, error: new Error('App version not specified'), data: {} };
    }
    try {
      remoteContext.sessionId = '';

      const downloadFilename = `${filename}-${platform}-${appVersion}.${extension}`;
      const filePath = path.resolve(HostPaths.doguTempPath(), downloadFilename);
      endpoint.info.capabilities.setApp(filePath);

      const headRes = await axios.head(url, {
        headers: {},
        timeout: DefaultHttpOptions.request.timeout,
      });
      const expectedFileSize = parseInt(headRes.headers['content-length']);

      const stat = await fs.promises.stat(filePath).catch(() => null);
      if (stat !== null) {
        if (stat.isFile()) {
          logger.info('File already exists', { filePath });
          logger.info(`File size local: ${stat.size} expected: ${expectedFileSize}`, { filePath });
          if (stat.size === expectedFileSize) {
            logger.info('File is same size. Skipping download', { filePath });
            return { request, ...{ reqBody: endpoint.info.capabilities.origin } };
          } else {
            logger.info('File is not same size. Deleting file', { filePath });
            await fs.promises.unlink(filePath);
            logger.info('File deleted', { filePath });
          }
        } else {
          logger.error('File is not a file', { filePath });
          throw new Error('File is not a file');
        }
      }

      const tempFileName = `${uuidv4()}.${extension}`;
      const tempFilePath = path.resolve(HostPaths.tempPath, tempFileName);
      if (!fs.existsSync(HostPaths.tempPath)) {
        fs.mkdirSync(HostPaths.tempPath, { recursive: true });
      }
      const response = await axios.get(url, {
        responseType: 'stream',
        headers: {},
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
      await postProcessTempFile(platform, tempFilePath, filePath);
      logger.info('File downloaded', { tempFilePath });

      endpoint.info.capabilities.setApp(filePath);

      return { request, ...{ reqBody: endpoint.info.capabilities.origin } };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return { status: error.response?.status ?? 500, error, data: {} };
      } else if (error instanceof Error) {
        return { status: 500, error, data: {} };
      }
      return { status: 500, error: new Error(stringify(error)), data: {} };
    }
  }
}

export class DeviceWebDriverSessionEndpointHandler extends DeviceWebDriverEndpointHandler {
  async onRequest(remoteContext: AppiumRemoteContext, endpoint: WebDriverEndPoint, request: RelayRequest, logger: DoguLogger): Promise<DeviceWebDriverEndpointHandlerResult> {
    if (endpoint.info.type !== 'session') {
      return { status: 400, error: new Error('Internal error. endpoint type is not session'), data: {} };
    }
    remoteContext.sessionId = endpoint.info.sessionId;
    return { request };
  }
}

function getAppExtension(platform: PlatformType): string {
  return extensionFromPlatform(platform);
}

async function postProcessTempFile(platform: PlatformType, tempFilePath: string, destFilePath: string): Promise<void> {
  const dirPath = path.dirname(destFilePath);
  await fs.promises.mkdir(dirPath, { recursive: true });
  await fs.promises.rename(tempFilePath, destFilePath);
}
