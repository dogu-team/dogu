import { Code, ErrorResultError, Platform, Serial } from '@dogu-private/types';
import { errorify, HeaderRecord } from '@dogu-tech/common';
import { RelayRequest, RelayResponse, SessionDeletedParam, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import { AppiumContextProxy } from '../appium/appium.context';
import { AppiumRemoteContext } from '../appium/appium.remote.context';
import { HttpRequestRelayService } from '../http-request-relay/http-request-relay.common';
import { DoguLogger } from '../logger/logger';
import { DeviceWebDriverHandler } from './device-webdriver.common';
import { AppiumEndpointHandlerService } from './endpoint-handler/appium.service';

export class AppiumDeviceWebDriverHandler implements DeviceWebDriverHandler {
  constructor(
    private readonly platform: Platform,
    private readonly serial: Serial,
    private readonly appiumContextProxy: AppiumContextProxy,
    private readonly httpRequestRelayService: HttpRequestRelayService,
    private readonly appiumEndpointHandlerService: AppiumEndpointHandlerService,
    private readonly logger: DoguLogger,
  ) {}

  async onRelayHttp(headers: HeaderRecord, request: RelayRequest): Promise<RelayResponse> {
    if (this.appiumContextProxy.key !== 'remote') {
      await this.appiumContextProxy.switchAppiumContext('remote');
    }

    const httpRequestRelayHandler = this.httpRequestRelayService.getHandler(request.method);
    if (!httpRequestRelayHandler) {
      throw new ErrorResultError(Code.CODE_MAP_KEY_NOTFOUND, `API method not found for key: ${request.method}`, {
        platform: this.platform,
        serial: this.serial,
        method: request.method,
      });
    }

    const appiumRemoteContext = this.appiumContextProxy.getImpl(AppiumRemoteContext);
    if (!appiumRemoteContext) {
      throw new ErrorResultError(Code.CODE_UNEXPECTED_ERROR, 'appiumRemoteContext is null', {
        platform: this.platform,
        serial: this.serial,
      });
    }

    const endpoint = await WebDriverEndPoint.fromRelayRequest(request);
    const endpointHandler = this.appiumEndpointHandlerService.getHandler(endpoint.info.type);
    if (endpointHandler) {
      const result = await endpointHandler.onBeforeRequest(appiumRemoteContext, this.appiumEndpointHandlerService.downloadService, headers, endpoint, request, this.logger);
      if (result.error) {
        throw result.error;
      }
      request = result.request;
    }

    const url = `http://127.0.0.1:${appiumRemoteContext.getInfo().server.port}${request.path}`;
    this.logger.info('AppiumDeviceWebDriverHandler.onRelayHttp', { url, method: request.method });
    const response = await httpRequestRelayHandler(url, request, this.logger);
    this.logger.info('AppiumDeviceWebDriverHandler.onRelayHttp', { url, status: response.status });

    return response;
  }

  async onSessionDeleted(headers: HeaderRecord, param: SessionDeletedParam): Promise<void> {
    if (this.appiumContextProxy.key === 'remote') {
      const appiumRemoteContext = this.appiumContextProxy.getImpl(AppiumRemoteContext);
      if (appiumRemoteContext.sessionId === param.sessionId) {
        try {
          await this.appiumContextProxy.switchAppiumContext('builtin');
        } catch (error) {
          this.logger.error('Error while switching to builtin context', { error: errorify(error) });
        }
      }
    }
  }
}
