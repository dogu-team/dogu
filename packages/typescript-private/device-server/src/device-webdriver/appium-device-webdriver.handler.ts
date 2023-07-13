import { Code, ErrorResultError, Platform, Serial } from '@dogu-private/types';
import { RelayRequest, RelayResponse, SessionDeletedParam, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { AppiumContextProxy } from '../appium/appium.context';
import { AppiumRemoteContext } from '../appium/appium.remote.context';
import { DoguLogger } from '../logger/logger';
import { AppiumDeviceWebDriverEndpointHandlerService } from './appium-device-webdriver.endpoint-handler-service';
import { DeviceWebDriverHandler } from './device-webdriver-handler.types';
import { RelayHttpRequestService } from './relay-http-request.service';

export class AppiumDeviceWebDriverHandler implements DeviceWebDriverHandler {
  constructor(
    private readonly platform: Platform,
    private readonly serial: Serial,
    private readonly contextProxy: AppiumContextProxy,
    private readonly relayHttpRequestService: RelayHttpRequestService,
    private readonly endpointHandlerService: AppiumDeviceWebDriverEndpointHandlerService,
    private readonly logger: DoguLogger,
  ) {}

  async onRelayHttp(request: RelayRequest): Promise<RelayResponse> {
    if (this.contextProxy.key !== 'remote') {
      await this.contextProxy.switchAppiumContext('remote');
    }

    if (!(request.method in this.appiumDeviceWebDriverHandlerService.methodHandlers)) {
      throw new ErrorResultError(Code.CODE_MAP_KEY_NOTFOUND, `API method not found for key: ${request.method}`, {
        platform: this.platform,
        serial: this.serial,
        method: request.method,
      });
    }

    const appiumRemoteContext = this.appiumContextProxy.getImpl(AppiumRemoteContext);
    if (!appiumRemoteContext) {
      throw new ErrorResultError(Code.CODE_UNEXPECTED_ERROR, 'appiumRemoteContext is null', {
        serial: this.serial,
      });
    }
    const endpoint = await WebDriverEndPoint.create(request);
    if (endpoint.info.type in this.service.endpointHandlers) {
      const handler = this.service.endpointHandlers[endpoint.info.type];
      const result = await handler.onRequest(appiumRemoteContext, endpoint, request, this.service.logger);
      if (result.error) {
        throw result.error;
      }
      request = result.request;
    }
    const url = `http://127.0.0.1:${appiumRemoteContext.getInfo().server.port}/${request.path}`;
    return this.service.methodHandlers[request.method](url, request, this.service.logger);
  }

  async onSessionDeleted(param: SessionDeletedParam): Promise<void> {
    if (this.appiumContextProxy.key === 'remote') {
      const appiumRemoteContext = this.appiumContextProxy.getImpl(AppiumRemoteContext);
      if (appiumRemoteContext.sessionId === param.sessionId) {
        await this.appiumContextProxy.switchAppiumContext('builtin');
      }
    }
  }
}
