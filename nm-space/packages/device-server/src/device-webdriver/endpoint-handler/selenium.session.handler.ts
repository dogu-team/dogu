import { DoguRemoteDeviceJobIdHeader, HeaderRecord } from '@dogu-tech/common';
import { RelayRequest, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import _ from 'lodash';
import { BrowserManagerService } from '../../browser-manager/browser-manager.service';
import { DoguLogger } from '../../logger/logger';
import { SeleniumService } from '../../selenium/selenium.service';
import { OnBeforeRequestResult } from './common';
import { RegisterSeleniumEndpointHandler, SeleniumEndpointHandler } from './selenium.service';

@RegisterSeleniumEndpointHandler()
export class SeleniumSessionEndpointHandler extends SeleniumEndpointHandler {
  get endpointType(): WebDriverEndpointType {
    return 'session';
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
