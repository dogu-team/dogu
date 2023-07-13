import { extensionFromPlatform, PlatformType } from '@dogu-private/types';
import { DefaultHttpOptions, DoguApplicationUrlHeader, DoguApplicationVersionHeader, DoguDevicePlatformHeader, HeaderRecord, stringify } from '@dogu-tech/common';
import { RelayRequest, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import axios from 'axios';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import stream, { Stream } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { AppiumRemoteContext } from '../../appium/appium.remote.context';
import { DoguLogger } from '../../logger/logger';
import { AppiumEndpointHandler, RegisterAppiumEndpointHandler } from './appium.service';
import { OnBeforeRequestResult } from './common';

function getAppExtension(platform: PlatformType): string {
  return extensionFromPlatform(platform);
}

async function postProcessTempFile(platform: PlatformType, tempFilePath: string, destFilePath: string): Promise<void> {
  const dirPath = path.dirname(destFilePath);
  await fs.promises.mkdir(dirPath, { recursive: true });
  await fs.promises.rename(tempFilePath, destFilePath);
}

@RegisterAppiumEndpointHandler()
export class AppiumNewSessionEndpointHandler extends AppiumEndpointHandler {
  get endpointType(): WebDriverEndpointType {
    return 'new-session';
  }

  async onBeforeRequest(
    remoteContext: AppiumRemoteContext,
    headers: HeaderRecord,
    endpoint: WebDriverEndPoint,
    request: RelayRequest,
    logger: DoguLogger,
  ): Promise<OnBeforeRequestResult> {
    if (endpoint.info.type !== 'new-session') {
      return {
        status: 400,
        error: new Error('Internal error. endpoint type is not new-session'),
        data: {},
      };
    }

    const appUrl = _.get(headers, DoguApplicationUrlHeader) as string | undefined;
    if (!appUrl) {
      return {
        status: 400,
        error: new Error('App url not specified'),
        data: {},
      };
    }

    const platform = _.get(headers, DoguDevicePlatformHeader) as PlatformType | undefined;
    if (!platform) {
      return {
        status: 400,
        error: new Error('Platform not specified'),
        data: {},
      };
    }

    const filename = path.basename(appUrl);
    const extension = getAppExtension(platform);
    const appVersion = _.get(headers, DoguApplicationVersionHeader) as string | undefined;
    if (!appVersion) {
      return {
        status: 400,
        error: new Error('App version not specified'),
        data: {},
      };
    }
    try {
      remoteContext.sessionId = '';

      const downloadFilename = `${filename}-${platform}-${appVersion}.${extension}`;
      const filePath = path.resolve(HostPaths.doguTempPath(), downloadFilename);
      _.set(endpoint.info.capabilities, 'capabilities.alwaysMatch.appium:app', filePath);

      const headRes = await axios.head(appUrl, {
        headers: {},
        timeout: DefaultHttpOptions.request.timeout,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const expectedFileSize = parseInt(headRes.headers['content-length']);

      const stat = await fs.promises.stat(filePath).catch(() => null);
      if (stat !== null) {
        if (stat.isFile()) {
          logger.info('File already exists', { filePath });
          logger.info(`File size local: ${stat.size} expected: ${expectedFileSize}`, { filePath });
          if (stat.size === expectedFileSize) {
            logger.info('File is same size. Skipping download', { filePath });
            return {
              request,
              ...{ reqBody: endpoint.info.capabilities },
            };
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
      const response = await axios.get(appUrl, {
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

      _.set(endpoint.info.capabilities, 'capabilities.alwaysMatch.appium:app', filePath);

      return { request, ...{ reqBody: endpoint.info.capabilities } };
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
