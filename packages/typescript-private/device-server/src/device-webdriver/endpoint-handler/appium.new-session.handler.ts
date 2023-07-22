import { extensionFromPlatform, PlatformType } from '@dogu-private/types';
import {
  DefaultHttpOptions,
  DoguApplicationFileSizeHeader,
  DoguApplicationUrlHeader,
  DoguApplicationVersionHeader,
  DoguBrowserNameHeader,
  DoguDevicePlatformHeader,
  DoguDeviceSerialHeader,
  HeaderRecord,
  stringify,
} from '@dogu-tech/common';
import { RelayRequest, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import axios from 'axios';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import stream, { Stream } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { AppiumRemoteContext } from '../../appium/appium.remote.context';
import { getFreePort } from '../../internal/util/net';
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

  override async onBeforeRequest(
    remoteContext: AppiumRemoteContext,
    headers: HeaderRecord,
    endpoint: WebDriverEndPoint,
    request: RelayRequest,
    logger: DoguLogger,
  ): Promise<OnBeforeRequestResult> {
    await super.onBeforeRequest(remoteContext, headers, endpoint, request, logger);

    if (endpoint.info.type !== 'new-session') {
      return {
        status: 400,
        error: new Error('Internal error. endpoint type is not new-session'),
        data: {},
      };
    }

    const deviceSerial = _.get(headers, DoguDeviceSerialHeader) as string | undefined;
    if (deviceSerial) {
      request.reqBody ??= {};
      _.set(request.reqBody, 'capabilities.alwaysMatch.appium:deviceName', deviceSerial);
      _.set(request.reqBody, 'capabilities.alwaysMatch.appium:udid', deviceSerial);
    }

    const platformName = _.get(headers, DoguDevicePlatformHeader) as PlatformType | undefined;
    if (platformName) {
      if (platformName === 'android') {
        request.reqBody ??= {};
        _.set(request.reqBody, 'capabilities.alwaysMatch.platformName', 'Android');
        _.set(request.reqBody, 'capabilities.alwaysMatch.appium:automationName', 'UiAutomator2');

        const systemPort = await getFreePort();
        const chromedriverPort = await getFreePort();
        const mjepgServerPort = await getFreePort();
        _.set(request.reqBody, 'capabilities.alwaysMatch.appium:systemPort', systemPort);
        _.set(request.reqBody, 'capabilities.alwaysMatch.appium:chromedriverPort', chromedriverPort);
        _.set(request.reqBody, 'capabilities.alwaysMatch.appium:mjpegServerPort', mjepgServerPort);
      } else if (platformName === 'ios') {
        request.reqBody ??= {};
        _.set(request.reqBody, 'capabilities.alwaysMatch.platformName', 'iOS');
        _.set(request.reqBody, 'capabilities.alwaysMatch.appium:automationName', 'XCUITest');

        const wdaLocalPort = await getFreePort();
        const mjpegServerPort = await getFreePort();
        _.set(request.reqBody, 'capabilities.alwaysMatch.appium:wdaLocalPort', wdaLocalPort);
        _.set(request.reqBody, 'capabilities.alwaysMatch.appium:mjpegServerPort', mjpegServerPort);
        _.set(request.reqBody, 'capabilities.alwaysMatch.appium:showXcodeLog', true);

        if (deviceSerial) {
          const { tempPath } = HostPaths;
          const derivedDataPath = path.resolve(tempPath, 'derived-data', deviceSerial);
          await fs.promises.mkdir(derivedDataPath, { recursive: true });
          _.set(request.reqBody, 'capabilities.alwaysMatch.appium:derivedDataPath', derivedDataPath);
        }
      }
    }

    const browserName = _.get(headers, DoguBrowserNameHeader) as string | undefined;
    if (browserName) {
      request.reqBody ??= {};
      _.set(request.reqBody, 'capabilities.alwaysMatch.browserName', browserName);

      const browserVersion = _.get(headers, DoguApplicationVersionHeader) as string | undefined;
      if (browserVersion) {
        _.set(request.reqBody, 'capabilities.alwaysMatch.browserVersion', browserVersion);
      }
    }

    const appUrl = _.get(headers, DoguApplicationUrlHeader) as string | undefined;
    if (appUrl) {
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

        request.reqBody ??= {};
        _.set(request.reqBody, 'capabilities.alwaysMatch.appium:app', filePath);

        const stat = await fs.promises.stat(filePath).catch(() => null);
        if (stat !== null) {
          if (stat.isFile()) {
            logger.info('File already exists', { filePath });

            const doguApplicationFileSize = _.get(headers, DoguApplicationFileSizeHeader) as string | undefined;
            if (doguApplicationFileSize) {
              const expectedFileSize = parseInt(doguApplicationFileSize);
              logger.info(`File size local: ${stat.size} expected: ${expectedFileSize}`, { filePath });

              if (stat.size === expectedFileSize) {
                logger.info('File is same size. Skipping download', { filePath });
                return { request };
              } else {
                logger.info('File is not same size. Deleting file', { filePath });
                await fs.promises.unlink(filePath);
                logger.info('File deleted', { filePath });
              }
            } else {
              logger.info('File size is not specified. Deleting file', { filePath });
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

        return { request };
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          return { status: error.response?.status ?? 500, error, data: {} };
        } else if (error instanceof Error) {
          return { status: 500, error, data: {} };
        }
        return { status: 500, error: new Error(stringify(error)), data: {} };
      }
    }

    return { request };
  }
}
