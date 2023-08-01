import { extensionFromPlatform, PlatformType } from '@dogu-private/types';
import {
  DoguApplicationFileSizeHeader,
  DoguApplicationUrlHeader,
  DoguApplicationVersionHeader,
  DoguBrowserNameHeader,
  DoguDevicePlatformHeader,
  DoguDeviceSerialHeader,
  errorify,
  HeaderRecord,
} from '@dogu-tech/common';
import { RelayRequest, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import url from 'url';
import { v4 as uuidv4 } from 'uuid';
import { AppiumRemoteContext } from '../../appium/appium.remote.context';
import { DeviceHostDownloadSharedResourceService } from '../../device-host/device-host.download-shared-resource';
import { DOGU_ADB_SERVER_PORT } from '../../internal/externals/cli/adb/adb';
import { getFreePort } from '../../internal/util/net';
import { DoguLogger } from '../../logger/logger';
import { AppiumEndpointHandler, RegisterAppiumEndpointHandler } from './appium.service';
import { OnBeforeRequestResult } from './common';

function getAppExtension(platform: PlatformType): string {
  return extensionFromPlatform(platform);
}

@RegisterAppiumEndpointHandler()
export class AppiumNewSessionEndpointHandler extends AppiumEndpointHandler {
  get endpointType(): WebDriverEndpointType {
    return 'new-session';
  }

  override async onBeforeRequest(
    remoteContext: AppiumRemoteContext,
    downloadService: DeviceHostDownloadSharedResourceService,
    headers: HeaderRecord,
    endpoint: WebDriverEndPoint,
    request: RelayRequest,
    logger: DoguLogger,
  ): Promise<OnBeforeRequestResult> {
    await super.onBeforeRequest(remoteContext, downloadService, headers, endpoint, request, logger);

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
        _.set(request.reqBody, 'capabilities.alwaysMatch.appium:adbPort', DOGU_ADB_SERVER_PORT);

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

      const appUrlParsed = url.parse(appUrl);
      const filename = path.basename(appUrlParsed.path ?? uuidv4()).substring(0, 30);
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

        const doguApplicationFileSize = _.get(headers, DoguApplicationFileSizeHeader) ? parseInt(_.get(headers, DoguApplicationFileSizeHeader)) : Number.MAX_SAFE_INTEGER;

        await downloadService.queueDownload({
          filePath,
          url: appUrl,
          headers: {},
          expectedFileSize: doguApplicationFileSize,
        });

        return { request };
      } catch (error: unknown) {
        const parsedError = errorify(error);
        return {
          status: 500,
          error: parsedError,
          data: {},
        };
      }
    }

    return { request };
  }
}
