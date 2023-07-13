import { RelayRequest, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import { AppiumRemoteContext } from '../../appium/appium.remote.context';
import { DoguLogger } from '../../logger/logger';
import { AppiumEndpointHandler, RegisterAppiumEndpointHandler } from './appium.service';
import { EndpointHandlerResult } from './common';

@RegisterAppiumEndpointHandler()
export class AppiumSessionEndpointHandler extends AppiumEndpointHandler {
  get endpointType(): WebDriverEndpointType {
    return 'session';
  }

  onRequest(remoteContext: AppiumRemoteContext, endpoint: WebDriverEndPoint, request: RelayRequest, logger: DoguLogger): EndpointHandlerResult {
    if (endpoint.info.type !== 'session') {
      return {
        status: 400,
        error: new Error('Internal error. endpoint type is not session'),
        data: {},
      };
    }
    remoteContext.sessionId = endpoint.info.sessionId;
    return { request };
  }
}
