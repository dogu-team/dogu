import { isValidBrowserName } from '@dogu-private/types';
import { DoguBrowserNameHeader, DoguRemoteDeviceJobIdHeader, HeaderRecord } from '@dogu-tech/common';
import { RelayRequest, RelayResponse, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import _ from 'lodash';
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

    const doguBrowserVersion = (_.get(headers, DoguBrowserNameHeader) as string | undefined) ?? 'latest';

    const doguRemoteDeviceJobId = _.get(headers, DoguRemoteDeviceJobIdHeader) as string | undefined;
    if (!doguRemoteDeviceJobId) {
      return {
        status: 401,
        error: new Error('doguRemoteDeviceJobId is not provided'),
        data: {},
      };
    }
    const seleniumContextInfo = await seleniumService.open({
      browserName: doguBrowserName,
      browserVersion: doguBrowserVersion,
      key: doguRemoteDeviceJobId,
    });

    request.reqBody = _.merge(request.reqBody, {
      capabilities: {
        alwaysMatch: {
          browserName: doguBrowserName,
          browserVersion: doguBrowserVersion,
        },
      },
    });
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
