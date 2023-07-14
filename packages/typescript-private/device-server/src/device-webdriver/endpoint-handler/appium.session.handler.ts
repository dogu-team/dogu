import { HeaderRecord } from '@dogu-tech/common';
import { RelayRequest, WebDriverEndPoint, WebDriverEndpointType } from '@dogu-tech/device-client-common';
import { AppiumRemoteContext } from '../../appium/appium.remote.context';
import { DoguLogger } from '../../logger/logger';
import { AppiumEndpointHandler, RegisterAppiumEndpointHandler } from './appium.service';
import { OnBeforeRequestResult } from './common';

@RegisterAppiumEndpointHandler()
export class AppiumSessionEndpointHandler extends AppiumEndpointHandler {
  get endpointType(): WebDriverEndpointType {
    return 'session';
  }

  override async onBeforeRequest(
    remoteContext: AppiumRemoteContext,
    headers: HeaderRecord,
    endpoint: WebDriverEndPoint,
    request: RelayRequest,
    logger: DoguLogger,
  ): Promise<OnBeforeRequestResult> {
    await super.onBeforeRequest(remoteContext, headers, endpoint, request, logger);

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
