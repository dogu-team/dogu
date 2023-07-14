import { Code, ErrorResultError, Platform, Serial } from '@dogu-private/types';
import { DoguRemoteDeviceJobIdHeader, errorify, HeaderRecord } from '@dogu-tech/common';
import { RelayRequest, RelayResponse, SessionDeletedParam, WebDriverEndPoint } from '@dogu-tech/device-client-common';
import _ from 'lodash';
import { HttpRequestRelayService } from '../http-request-relay/http-request-relay.common';
import { DoguLogger } from '../logger/logger';
import { SeleniumService } from '../selenium/selenium.service';
import { DeviceWebDriverHandler } from './device-webdriver.common';
import { SeleniumEndpointHandlerService } from './endpoint-handler/selenium.service';

export class SeleniumDeviceWebDriverHandler implements DeviceWebDriverHandler {
  constructor(
    private readonly platform: Platform,
    private readonly serial: Serial,
    private readonly seleniumService: SeleniumService,
    private readonly httpRequestRelayService: HttpRequestRelayService,
    private readonly seleniumEndpointHandlerService: SeleniumEndpointHandlerService,
    private readonly logger: DoguLogger,
  ) {}

  async onRelayHttp(headers: HeaderRecord, request: RelayRequest): Promise<RelayResponse> {
    const httpRequestRelayHandler = this.httpRequestRelayService.getHandler(request.method);
    if (!httpRequestRelayHandler) {
      throw new ErrorResultError(Code.CODE_MAP_KEY_NOTFOUND, `API method not found for key: ${request.method}`, {
        platform: this.platform,
        serial: this.serial,
        method: request.method,
      });
    }

    const endpoint = await WebDriverEndPoint.create(request);
    const endpointHandler = this.seleniumEndpointHandlerService.getHandler(endpoint.info.type);
    if (endpointHandler) {
      try {
        const result = await endpointHandler.onBeforeRequest(this.seleniumService, headers, endpoint, request, this.logger);
        if (result.error) {
          throw result.error;
        }
        request = result.request;
      } catch (error) {
        this.logger.error('Failed to handle onBeforeRequest', { error: errorify(error) });
        throw error;
      }
    }

    const doguRemoteDeviceJobId = _.get(headers, DoguRemoteDeviceJobIdHeader) as string | undefined;
    if (!doguRemoteDeviceJobId) {
      throw new ErrorResultError(Code.CODE_UNEXPECTED_ERROR, 'doguRemoteDeviceJobId is not provided', {
        platform: this.platform,
        serial: this.serial,
      });
    }

    const seleniumContextInfo = await this.seleniumService.getInfo(doguRemoteDeviceJobId);
    if (!seleniumContextInfo) {
      throw new ErrorResultError(Code.CODE_UNEXPECTED_ERROR, 'seleniumContextInfo is not found', {
        platform: this.platform,
        serial: this.serial,
      });
    }

    const url = `http://127.0.0.1:${seleniumContextInfo.port}${request.path}`;
    const response = await httpRequestRelayHandler(url, request, this.logger);

    if (endpointHandler) {
      try {
        const result = await endpointHandler.onAfterRequest(this.seleniumService, headers, endpoint, request, response, this.logger);
        if (result.error) {
          throw result.error;
        }
        return result.response;
      } catch (error) {
        this.logger.error('Failed to handle onAfterRequest', { error: errorify(error) });
        throw error;
      }
    }

    return response;
  }

  async onSessionDeleted(headers: HeaderRecord, param: SessionDeletedParam): Promise<void> {
    const doguRemoteDeviceJobId = _.get(headers, DoguRemoteDeviceJobIdHeader) as string | undefined;
    if (doguRemoteDeviceJobId) {
      await this.seleniumService.close(doguRemoteDeviceJobId);
      return;
    }

    await this.seleniumService.closeBySessionId(param.sessionId);
  }
}
