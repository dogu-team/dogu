import { PrivateDevice } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, DeviceId, OrganizationId, Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, DefaultHttpOptions, Instance, parseAxiosError, stringify, transformAndValidate } from '@dogu-tech/common';
import { DeviceRuntimeInfoSubscribe, RuntimeInfoDto } from '@dogu-tech/device-client';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { lastValueFrom } from 'rxjs';
import WebSocket from 'ws';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { DeviceResolutionInfo } from '../types';
import { OnDeviceConnectionSubscriberDisconnectedEvent, OnDeviceDisconnectedEvent, OnDeviceResolvedEvent } from './device.events';

type Value = DeviceResolutionInfo & { webSocket: WebSocket };

@Injectable()
export class DeviceRuntimeInfoSubscriber {
  private readonly _devices = new Map<Serial, Value>();

  constructor(private readonly logger: DoguLogger, private readonly consoleClientService: ConsoleClientService) {}

  @OnEvent(OnDeviceConnectionSubscriberDisconnectedEvent.key)
  onDeviceConnectionSubscriberDisconnected(value: Instance<typeof OnDeviceConnectionSubscriberDisconnectedEvent.value>): void {
    this._devices.clear();
  }

  @OnEvent(OnDeviceResolvedEvent.key)
  onDeviceResolved(value: Instance<typeof OnDeviceResolvedEvent.value>): void {
    const { organizationId, deviceId, serial } = value;
    if (this._devices.has(serial)) {
      throw new Error(`device ${serial} already exists`);
    }
    const webSocket = this.subscribeRuntimeInfo(organizationId, deviceId, serial);
    this._devices.set(serial, { ...value, webSocket });
  }

  @OnEvent(OnDeviceDisconnectedEvent.key)
  onDeviceDisconnected(value: Instance<typeof OnDeviceDisconnectedEvent.value>): void {
    const { serial } = value;
    const device = this._devices.get(serial);
    if (!device) {
      throw new Error(`device ${serial} not exists`);
    }
    const { webSocket } = device;
    closeWebSocketWithTruncateReason(webSocket, 1000, 'Device disconnected');
    this._devices.delete(serial);
  }

  private subscribeRuntimeInfo(organizationId: OrganizationId, deviceId: DeviceId, serial: Serial): WebSocket {
    const webSocket = new WebSocket(`ws://${env.DOGU_DEVICE_SERVER_HOST_PORT}${DeviceRuntimeInfoSubscribe.path}`);
    webSocket.on('open', () => {
      this.logger.debug('deviceRuntimeInfoSubscribe.open');
      const sendMessage: Instance<typeof DeviceRuntimeInfoSubscribe.sendMessage> = {
        serial,
      };
      webSocket.send(JSON.stringify(sendMessage));
    });
    webSocket.on('error', (error) => {
      this.logger.error('deviceRuntimeInfoSubscribe.error', { error });
    });
    webSocket.on('close', (code, reason) => {
      this.logger.info('deviceRuntimeInfoSubscribe.close', { code, reason: reason.toString() });
    });
    webSocket.on('message', (data, isBinary) => {
      (async (): Promise<void> => {
        // this.logger.debug('deviceRuntimeInfoSubscribe.message', { data: isBinary ? data : data.toString(), isBinary });
        const validated = await transformAndValidate(DeviceRuntimeInfoSubscribe.receiveMessage, JSON.parse(data.toString()));
        const { runtimeInfo } = validated;
        await this.writeDeviceRunTimeInfos(organizationId, deviceId, runtimeInfo);
      })().catch((error) => {
        this.logger.error('deviceRuntimeInfoSubscribe.message.error', { error: stringify(error) });
      });
    });
    return webSocket;
  }

  private async writeDeviceRunTimeInfos(organizationId: OrganizationId, deviceId: DeviceId, runtimeInfo: RuntimeInfoDto): Promise<void> {
    const pathProvider = new PrivateDevice.writeDeviceRunTimeInfos.pathProvider(organizationId, deviceId);
    const path = PrivateDevice.writeDeviceRunTimeInfos.resolvePath(pathProvider);
    const requestBody: Instance<typeof PrivateDevice.writeDeviceRunTimeInfos.requestBody> = {
      runtimeInfos: [runtimeInfo],
    };
    await lastValueFrom(
      this.consoleClientService.service.post(path, requestBody, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      }),
    ).catch((error) => {
      this.logger.error('writeDeviceRunTimeInfos.error', { error: parseAxiosError(error) });
    });
  }
}
