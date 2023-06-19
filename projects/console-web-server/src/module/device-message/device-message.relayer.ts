import { EventParam, HttpProxyRequest, Param, ParamValue, RequestParam, Result, WebSocketProxyConnect, WebSocketProxyId } from '@dogu-private/console-host-agent';
import { DeviceId, ErrorResultError, OrganizationId } from '@dogu-private/types';
import { Class, Instance, loop, Method, stringify, transformAndValidate, WebSocketSpec } from '@dogu-tech/common';
import { DeviceServerResponseDto } from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config';
import { DoguLogger } from '../logger/logger';
import { DeviceMessageQueue } from './device-message.queue';

class WebSocketProxy<S extends Class<S>, R extends Class<R>> {
  constructor(
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
    private readonly organizationId: OrganizationId,
    private readonly deviceId: DeviceId,
    private readonly webSocketProxyId: WebSocketProxyId,
    private readonly spec: WebSocketSpec<S, R>,
  ) {}

  send(message: Instance<S>): Promise<void> {
    return this.deviceMessageRelayer.sendWebSocketMessage(this.organizationId, this.deviceId, this.webSocketProxyId, JSON.stringify(message));
  }

  receive(): AsyncGenerator<Instance<R>> {
    return this.deviceMessageRelayer.receiveWebSocketMessage(this.organizationId, this.deviceId, this.webSocketProxyId, this.spec);
  }
}

@Injectable()
export class DeviceMessageRelayer {
  constructor(private readonly deviceMessageQueue: DeviceMessageQueue, private readonly logger: DoguLogger) {}

  async sendParam(organizationId: OrganizationId, deviceId: DeviceId, paramValue: ParamValue): Promise<Result> {
    return new Promise<Result>((resolve, reject): void => {
      (async (): Promise<void> => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let resultId: string | null = null;
        const clear = async (): Promise<void> => {
          if (timeoutId !== null) {
            try {
              clearTimeout(timeoutId);
            } catch (error) {
              this.logger.error('clearTimeout error', { error });
            }
          }
          if (resultId !== null) {
            try {
              await this.deviceMessageQueue.deleteResult(organizationId, deviceId, resultId);
            } catch (error) {
              this.logger.error('deleteResult error', { error });
            }
          }
        };
        try {
          timeoutId = setTimeout(() => {
            reject('Param timeout');
          }, config.device.param.timeoutMilliseconds);
          if (timeoutId === null) {
            reject('timeoutId is null');
          }
          resultId = uuidv4();
          const param: Param = {
            resultId,
            value: paramValue,
          };
          const transformed = await transformAndValidate(Param, param);
          await this.deviceMessageQueue.pushParam(organizationId, deviceId, transformed);
          for await (const _ of loop(config.device.message.intervalMilliseconds)) {
            const resultData = await this.deviceMessageQueue.popResultData(organizationId, deviceId, resultId);
            if (resultData === null) {
              continue;
            }
            const result = await transformAndValidate(Result, JSON.parse(resultData));
            resolve(result);
          }
        } catch (error) {
          this.logger.error('sendParam error', { error });
          throw error;
        } finally {
          await clear();
        }
        throw new Error('unhandled error');
      })().catch((error) => {
        reject(error);
      });
    });
  }

  async sendHttpRequest<ResponseBodyConstructor extends Class<ResponseBodyConstructor>>(
    organizationId: OrganizationId,
    deviceId: DeviceId,
    method: Method,
    path: string,
    headers: Record<string, string> | undefined,
    query: Record<string, unknown> | undefined,
    body: object | undefined,
    responseBodyConstructor: ResponseBodyConstructor,
  ): Promise<Instance<ResponseBodyConstructor>> {
    const HttpProxyRequest: HttpProxyRequest = {
      kind: 'HttpProxyRequest',
      method,
      path,
      headers,
      query,
      body,
    };
    const requestParam: RequestParam = {
      kind: 'RequestParam',
      value: HttpProxyRequest,
    };
    const result = await this.sendParam(organizationId, deviceId, requestParam);
    const { value } = result;
    const { kind } = value;
    if (kind === 'ResponseResult') {
      const deviceHttpResponse = value.value;
      const { body } = deviceHttpResponse;
      const response = await transformAndValidate(DeviceServerResponseDto, body);
      const responseValue = response.value;
      const { $case } = responseValue;
      if ($case === 'error') {
        const errorResult = responseValue.error;
        throw new ErrorResultError(errorResult.code, errorResult.message, errorResult.details);
      } else if ($case === 'data') {
        const responseBody = responseValue.data;
        if (responseBody === undefined) {
          throw new Error('Unexpected undefined responseBody');
        }
        return transformAndValidate(responseBodyConstructor, responseBody);
      } else {
        throw new Error(`Unexpected $case ${stringify($case)}`);
      }
    } else if (kind === 'ErrorResult') {
      const errorResult = value.value;
      throw new ErrorResultError(errorResult.code, errorResult.message, errorResult.details);
    }
    throw new Error(`Unexpected result kind ${kind}`);
  }

  async connectWebSocket<S extends Class<S>, R extends Class<R>>(organizationId: OrganizationId, deviceId: DeviceId, spec: WebSocketSpec<S, R>): Promise<WebSocketProxy<S, R>> {
    const { path } = spec;
    const webSocketProxyId = uuidv4();
    const WebSocketProxyConnect: WebSocketProxyConnect = {
      kind: 'WebSocketProxyConnect',
      webSocketProxyId,
      path,
    };
    const eventParam: EventParam = {
      kind: 'EventParam',
      value: WebSocketProxyConnect,
    };
    const result = await this.sendParam(organizationId, deviceId, eventParam);
    const { value } = result;
    const { kind } = value;
    if (kind === 'EventResult') {
      return new WebSocketProxy(this, organizationId, deviceId, webSocketProxyId, spec);
    } else if (kind === 'ErrorResult') {
      const errorResult = value.value;
      throw new ErrorResultError(errorResult.code, errorResult.message, errorResult.details);
    }
    throw new Error(`Unexpected result kind ${kind}`);
  }

  async *receiveWebSocketMessage<S extends Class<S>, R extends Class<R>>(
    organizationId: OrganizationId,
    deviceId: DeviceId,
    webSocketProxyId: string,
    spec: WebSocketSpec<S, R>,
  ): AsyncGenerator<Instance<R>> {
    for await (const _ of loop(config.virtualWebSocket.pop.intervalMilliseconds)) {
      const receives = await this.deviceMessageQueue.popWebSocketProxyReceives(organizationId, deviceId, webSocketProxyId, config.virtualWebSocket.pop.count);
      for (const receive of receives) {
        const { value } = receive;
        const { kind } = value;
        this.logger.verbose('receiveWebSocketMessage', { organizationId, deviceId, webSocketProxyId, value });
        if (kind === 'WebSocketProxyReceiveOpen') {
        } else if (kind === 'WebSocketProxyReceiveError') {
          const { error, message } = value;
          throw new Error(`WebSocketProxyReceiveError error ${stringify(error)} ${message}`);
        } else if (kind === 'WebSocketProxyReceiveClose') {
          return;
        } else if (kind === 'WebSocketProxyReceiveMessage') {
          const { data } = value;
          try {
            const validated = await transformAndValidate(spec.receiveMessage, JSON.parse(data));
            yield validated;
          } catch (error) {
            this.logger.error('receiveWebSocketMessage parse error', { error: stringify(error) });
            throw error;
          }
        } else {
          throw new Error(`Unexpected kind ${stringify(kind)}`);
        }
      }
    }
  }

  async sendWebSocketMessage(organizationId: OrganizationId, deviceId: DeviceId, webSocketProxyId: string, data: string): Promise<void> {
    const eventParam: EventParam = {
      kind: 'EventParam',
      value: {
        kind: 'WebSocketProxySend',
        value: {
          kind: 'WebSocketProxySendMessage',
          webSocketProxyId,
          data,
        },
      },
    };
    const result = await this.sendParam(organizationId, deviceId, eventParam);
    const { value } = result;
    const { kind } = value;
    if (kind === 'EventResult') {
      return;
    } else if (kind === 'ErrorResult') {
      const errorResult = value.value;
      throw new ErrorResultError(errorResult.code, errorResult.message, errorResult.details);
    }
    throw new Error(`Unexpected result kind ${kind}`);
  }
}
