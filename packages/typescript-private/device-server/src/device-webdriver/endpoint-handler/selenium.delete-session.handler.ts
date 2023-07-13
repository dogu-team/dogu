import { DoguRemoteDeviceJobIdHeader, HeaderRecord } from '@dogu-tech/common';
import { RelayRequest, RelayResponse, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import _ from 'lodash';
import { DoguLogger } from '../../logger/logger';
import { SeleniumService } from '../../selenium/selenium.service';
import { OnAfterRequestResult } from './common';
import { RegisterSeleniumEndpointHandler, SeleniumEndpointHandler } from './selenium.service';

@RegisterSeleniumEndpointHandler()
export class SeleniumDeleteSessionEndpointHandler extends SeleniumEndpointHandler {
  get endpointType(): WebDriverEndpointType {
    return 'delete-session';
  }

  override async onAfterRequest(
    seleniumService: SeleniumService,
    headers: HeaderRecord,
    endpoint: WebDriverEndPoint,
    request: RelayRequest,
    response: RelayResponse,
    logger: DoguLogger,
  ): Promise<OnAfterRequestResult> {
    const doguRemoteDeviceJobId = _.get(headers, DoguRemoteDeviceJobIdHeader) as string | undefined;
    if (!doguRemoteDeviceJobId) {
      return {
        status: 401,
        error: new Error('doguRemoteDeviceJobId is not provided'),
        data: {},
      };
    }

    await seleniumService.close(doguRemoteDeviceJobId);

    return super.onAfterRequest(seleniumService, headers, endpoint, request, response, logger);
  }
}
