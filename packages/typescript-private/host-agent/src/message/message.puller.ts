import { ErrorResult, Param, ParamValue, PrivateDevice, PrivateDeviceWs, Result, ResultValue } from '@dogu-private/console-host-agent';
import { Code, createConsoleApiAuthHeader, DeviceId, OrganizationId, Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, DuplicatedCallGuarder, errorify, Instance, stringify, transformAndValidate } from '@dogu-tech/common';
import { MultiPlatformEnvironmentVariableReplacer } from '@dogu-tech/node';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import WebSocket from 'ws';
import { ConsoleClientService } from '../console-client/console-client.service';
import { getConsoleBaseUrlWs } from '../console-client/console-url';
import { OnDeviceDisconnectedEvent, OnDeviceResolvedEvent } from '../device/device.events';
import { DeviceRegistry } from '../device/device.registry';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { DeviceResolutionInfo, MessageHandlers, MessageInfo } from '../types';
import { MessageRouter } from './message.router';
import { MessageContext, NullMessageEventHandler } from './message.types';

type Value = DeviceResolutionInfo & { webSocket: WebSocket };
@Injectable()
export class MessagePuller {
  private readonly pullDuplicatedCallGuader = new DuplicatedCallGuarder();
  private messageHandlers: MessageHandlers | null = null;
  private readonly _devices = new Map<Serial, Value>();

  constructor(private readonly consoleClientService: ConsoleClientService, private readonly deviceRegistry: DeviceRegistry, private readonly logger: DoguLogger) {}

  @OnEvent(OnDeviceResolvedEvent.key)
  onDeviceResolved(value: Instance<typeof OnDeviceResolvedEvent.value>): void {
    const { serial } = value;
    if (this._devices.has(serial)) {
      throw new Error(`MessagePuller.device ${serial} already exists`);
    }
    this.subscribeDevice(value);
  }

  subscribeDevice(value: Instance<typeof OnDeviceResolvedEvent.value>): void {
    const webSocket = this.subscribeParamDatas(value);
    this._devices.set(value.serial, { ...value, webSocket });
  }

  @OnEvent(OnDeviceDisconnectedEvent.key)
  onDeviceDisconnected(value: Instance<typeof OnDeviceDisconnectedEvent.value>): void {
    const { serial } = value;
    const device = this._devices.get(serial);
    if (!device) {
      throw new Error(`MessagePuller.device ${serial} not exists`);
    }
    const { webSocket } = device;
    this._devices.delete(serial);
    closeWebSocketWithTruncateReason(webSocket, 1000, 'Device disconnected');
  }

  setMessageHandlers(handlers: MessageHandlers): void {
    this.messageHandlers = handlers;
  }

  private subscribeParamDatas(value: Instance<typeof OnDeviceResolvedEvent.value>): WebSocket {
    const { organizationId, hostId, deviceId } = value;

    const webSocket = new WebSocket(
      `${getConsoleBaseUrlWs()}${PrivateDeviceWs.pullDeviceParamDatas.path}?organizationId=${organizationId}&hostId=${hostId}&deviceId=${deviceId}`,
      createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
    );
    webSocket.on('open', () => {
      this.logger.debug('MessagePuller.subscribeParamDatas.open', { serial: value.serial });
    });
    webSocket.on('error', (error) => {
      this.logger.error('MessagePuller.subscribeParamDatas.error', { serial: value.serial, error });
    });
    webSocket.on('close', (code, reason) => {
      this.logger.info('MemssagePuller.subscribeParaDatas.close', { serial: value.serial, code, reason: reason.toString() });
      if (this._devices.has(value.serial)) {
        setTimeout(() => {
          this.logger.info('MemssagePuller.subscribeParaDatas.reconnect', { serial: value.serial });
          this.subscribeDevice(value);
        }, 1000);
      }
    });
    webSocket.on('message', (data, isBinary) => {
      (async (): Promise<void> => {
        const response = await transformAndValidate(PrivateDeviceWs.pullDeviceParamDatas.receiveMessage, JSON.parse(data.toString()));
        const { datas } = response;
        datas.forEach((data) => {
          this.processParamData(value, data).catch((error) => {
            this.logger.error('MessagePuller.process param data failed', {
              deviceResolutionInfo: value,
              data,
              error: errorify(error),
            });
          });
        });
      })().catch((error) => {
        this.logger.error('MessagePuller.subscribeParamDatas.message.error', { serial: value.serial, error: stringify(error) });
      });
    });
    return webSocket;
  }

  private async processParamData(deviceResolutionInfo: DeviceResolutionInfo, paramData: string): Promise<void> {
    this.logger.verbose('process param data', {
      deviceResolutionInfo,
      paramData,
    });

    const { deviceId, organizationId } = deviceResolutionInfo;
    const param = await transformAndValidate(Param, JSON.parse(paramData));
    const { resultId, value } = param;

    const messageInfo: MessageInfo = {
      ...deviceResolutionInfo,
    };

    if (this.messageHandlers === null) {
      throw new Error('message handlers not set');
    }

    const resultValue = await this.processParam(messageInfo, value, this.messageHandlers);
    const result: Result = {
      value: resultValue,
    };
    await this.sendResult(organizationId, deviceId, resultId, result);
  }

  private async processParam(messageInfo: MessageInfo, paramValue: ParamValue, messageHandlers: MessageHandlers): Promise<ResultValue> {
    const router = new MessageRouter(messageHandlers);
    const context = new MessageContext(messageInfo, router, new MultiPlatformEnvironmentVariableReplacer(), NullMessageEventHandler);
    try {
      const resultValue = await router.route<ParamValue, ResultValue>(paramValue, context);
      return resultValue;
    } catch (error) {
      const errorResult: ErrorResult = {
        kind: 'ErrorResult',
        value: {
          code: Code.CODE_HOST_AGENT_DEVICE_REQUEST_FAILED,
          message: 'device request failed',
          details: {
            error,
          },
        },
      };
      return errorResult;
    }
  }

  private async sendResult(organizationId: OrganizationId, deviceId: DeviceId, resultId: string, result: Result): Promise<void> {
    const pathProvider = new PrivateDevice.pushDeviceResult.pathProvider(organizationId, deviceId, resultId);
    const path = PrivateDevice.pushDeviceResult.resolvePath(pathProvider);
    const requestBody: Instance<typeof PrivateDevice.pushDeviceResult.requestBody> = {
      result,
    };
    await this.consoleClientService.client
      .post<Instance<typeof PrivateDevice.pushDeviceResult.requestBody>>(path, requestBody, createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN))
      .catch((error) => {
        this.logger.error('push device result failed', {
          organizationId,
          deviceId,
          resultId,
          error: errorify(error),
        });
        throw error;
      });
  }
}
