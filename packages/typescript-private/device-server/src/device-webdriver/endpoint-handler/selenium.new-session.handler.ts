import { isValidBrowserName } from '@dogu-private/types';
import { DoguBrowserNameHeader, DoguBrowserVersionHeader, DoguRemoteDeviceJobIdHeader, HeaderRecord } from '@dogu-tech/common';
import { RelayRequest, RelayResponse, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import _ from 'lodash';
import { BrowserInstaller } from '../../browser-installer';
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
    seleniumService: SeleniumService,
    headers: HeaderRecord,
    endpoint: WebDriverEndPoint,
    request: RelayRequest,
    logger: DoguLogger,
  ): Promise<OnBeforeRequestResult> {
    await super.onBeforeRequest(seleniumService, headers, endpoint, request, logger);

    const doguBrowserName = _.get(headers, DoguBrowserNameHeader) as string | undefined;
    if (!doguBrowserName) {
      return {
        status: 401,
        error: new Error('doguBrowserName is not provided'),
        data: {},
      };
    }
    if (!isValidBrowserName(doguBrowserName)) {
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
    if (doguBrowserName === 'firefox') {
      doguBrowserVersion ??= 'latest';
      if (doguBrowserVersion === 'latest') {
        function parseFirefoxMajorVersion(version: string): number | undefined {
          const match = version.match(/^(\d+).*$/);
          if (match) {
            return Number(match[1]);
          }
          return undefined;
        }
        const resolvedVersion = await new BrowserInstaller().resolveLatestVersion('firefox', doguBrowserVersion);
        const resolvedMajorVersion = parseFirefoxMajorVersion(resolvedVersion);
        if (!resolvedMajorVersion) {
          return {
            status: 401,
            error: new Error(`Failed to resolve firefox version: ${resolvedVersion}`),
            data: {},
          };
        }
        doguBrowserVersion = `${resolvedMajorVersion}`;
      }
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
