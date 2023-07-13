import { DoguRemoteDeviceJobIdHeader, HeaderRecord } from '@dogu-tech/common';
import { RelayRequest, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import _ from 'lodash';
import { DoguLogger } from '../../logger/logger';
import { isValidBrowserName } from '../../selenium/selenium.context';
import { SeleniumService } from '../../selenium/selenium.service';
import { EndpointHandlerResult } from './common';
import { RegisterSeleniumEndpointHandler, SeleniumEndpointHandler } from './selenium.service';

@RegisterSeleniumEndpointHandler()
export class SeleniumNewSessionEndpointHandler extends SeleniumEndpointHandler {
  get endpointType(): WebDriverEndpointType {
    return 'new-session';
  }

  async onRequest(seleniumService: SeleniumService, headers: HeaderRecord, endpoint: WebDriverEndPoint, request: RelayRequest, logger: DoguLogger): Promise<EndpointHandlerResult> {
    if (endpoint.info.type !== 'new-session') {
      return {
        status: 500,
        error: new Error('Internal error. endpoint type is not new-session'),
        data: {},
      };
    }
    const { doguOptions } = endpoint.info.capabilities;
    const { browserName: browserNameRaw, browserVersion: browserVersionRaw } = doguOptions;
    const browserName = browserNameRaw ?? 'chrome';
    if (!isValidBrowserName(browserName)) {
      return {
        status: 401,
        error: new Error(`Invalid browser name: ${browserName}`),
        data: {
          browserName,
        },
      };
    }
    const browserVersion = browserVersionRaw ?? 'latest';
    const doguRemoteDeviceJobId = _.get(headers, DoguRemoteDeviceJobIdHeader) as string | undefined;
    if (!doguRemoteDeviceJobId) {
      return {
        status: 401,
        error: new Error('doguRemoteDeviceJobId is not provided'),
        data: {},
      };
    }
    const seleniumContextInfo = await seleniumService.open({
      browserName,
      browserVersion,
      key: doguRemoteDeviceJobId,
    });
    return {
      request,
    };
  }
}
