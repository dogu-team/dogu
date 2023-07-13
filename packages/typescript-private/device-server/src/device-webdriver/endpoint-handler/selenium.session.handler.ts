import { DoguRemoteDeviceJobIdHeader, HeaderRecord } from '@dogu-tech/common';
import { RelayRequest, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import _ from 'lodash';
import { DoguLogger } from '../../logger/logger';
import { SeleniumService } from '../../selenium/selenium.service';
import { EndpointHandlerResult } from './common';
import { RegisterSeleniumEndpointHandler, SeleniumEndpointHandler } from './selenium.service';

@RegisterSeleniumEndpointHandler()
export class SeleniumSessionEndpointHandler extends SeleniumEndpointHandler {
  get endpointType(): WebDriverEndpointType {
    return 'session';
  }

  async onRequest(seleniumService: SeleniumService, headers: HeaderRecord, endpoint: WebDriverEndPoint, request: RelayRequest, logger: DoguLogger): Promise<EndpointHandlerResult> {
    const doguRemoteDeviceJobId = _.get(headers, DoguRemoteDeviceJobIdHeader) as string | undefined;
    if (!doguRemoteDeviceJobId) {
      return {
        status: 401,
        error: new Error('doguRemoteDeviceJobId is not provided'),
        data: {},
      };
    }
    const seleniumContextInfo = await seleniumService.getInfo(doguRemoteDeviceJobId);
    if (!seleniumContextInfo) {
      return {
        status: 500,
        error: new Error('seleniumContextInfo is not found'),
        data: {},
      };
    }
    return {
      request,
    };
  }
}
