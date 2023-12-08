import { isAllowedBrowserName } from '@dogu-private/types';
import { assertUnreachable, DoguBrowserNameHeader, DoguBrowserVersionHeader, DoguRemoteDeviceJobIdHeader, HeaderRecord } from '@dogu-tech/common';
import { RelayRequest, RelayResponse, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import _ from 'lodash';
import { BrowserManagerService } from '../../browser-manager/browser-manager.service';
import { firefoxVersionUtils } from '../../browser-manager/firefox-version-utils';
import { DoguLogger } from '../../logger/logger';
import { SeleniumService } from '../../selenium/selenium.service';
import { OnAfterRequestResult, OnBeforeRequestResult } from './common';
import { RegisterSeleniumEndpointHandler, SeleniumEndpointHandler } from './selenium.service';

@RegisterSeleniumEndpointHandler()
export class SeleniumNewSessionEndpointHandler extends SeleniumEndpointHandler {
  get endpointType(): WebDriverEndpointType {
    return 'new-session';
  }

  override async onBeforeRequest(
    browserManagerService: BrowserManagerService,
    seleniumService: SeleniumService,
    headers: HeaderRecord,
    endpoint: WebDriverEndPoint,
    request: RelayRequest,
    logger: DoguLogger,
  ): Promise<OnBeforeRequestResult> {
    await super.onBeforeRequest(browserManagerService, seleniumService, headers, endpoint, request, logger);

    const doguBrowserName = _.get(headers, DoguBrowserNameHeader) as string | undefined;
    if (!doguBrowserName) {
      return {
        status: 401,
        error: new Error('doguBrowserName is not provided'),
        data: {},
      };
    }

    if (!isAllowedBrowserName(doguBrowserName)) {
      return {
        status: 401,
        error: new Error(`doguBrowserName is not valid: ${doguBrowserName}`),
        data: {},
      };
    }

    const doguRemoteDeviceJobId = _.get(headers, DoguRemoteDeviceJobIdHeader) as string | undefined;
    if (!doguRemoteDeviceJobId) {
      return {
        status: 401,
        error: new Error('doguRemoteDeviceJobId is not provided'),
        data: {},
      };
    }

    let doguBrowserVersion = _.get(headers, DoguBrowserVersionHeader) as string | undefined;
    switch (doguBrowserName) {
      case 'firefox':
      case 'firefox-devedition':
        {
          doguBrowserVersion ??= 'latest';
          if (doguBrowserVersion === 'latest') {
            const latestBrowserVersion = await browserManagerService.getLatestBrowserVersion({ browserName: doguBrowserName });
            const browserMajorVersion = firefoxVersionUtils.parse(latestBrowserVersion).major;
            doguBrowserVersion = `${browserMajorVersion}`;
          }
        }
        break;
      case 'chrome':
      case 'safari':
      case 'safaritp':
      case 'edge':
      case 'iexplorer':
      case 'samsung-internet':
        break;
      default:
        assertUnreachable(doguBrowserName);
    }

    const seleniumContextInfo = await seleniumService.open({
      browserName: doguBrowserName,
      browserVersion: doguBrowserVersion,
      key: doguRemoteDeviceJobId,
    });

    request.reqBody ??= {};
    _.set(request.reqBody, 'capabilities.alwaysMatch.browserName', doguBrowserName);
    if (doguBrowserVersion) {
      _.set(request.reqBody, 'capabilities.alwaysMatch.browserVersion', doguBrowserVersion);
    }

    return {
      request,
    };
  }

  override async onAfterRequest(
    seleniumService: SeleniumService,
    headers: HeaderRecord,
    endpoint: WebDriverEndPoint,
    request: RelayRequest,
    response: RelayResponse,
    logger: DoguLogger,
  ): Promise<OnAfterRequestResult> {
    const sessionId = _.get(response.resBody, 'value.sessionId') as string | undefined;
    const doguRemoteDeviceJobId = _.get(headers, DoguRemoteDeviceJobIdHeader) as string | undefined;
    if (sessionId && doguRemoteDeviceJobId) {
      const info = await seleniumService.getInfo(doguRemoteDeviceJobId);
      if (info) {
        info.sessionId = sessionId;
      }
    }

    return super.onAfterRequest(seleniumService, headers, endpoint, request, response, logger);
  }
}
