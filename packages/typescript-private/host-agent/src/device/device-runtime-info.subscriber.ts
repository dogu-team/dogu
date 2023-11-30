import { PrivateDevice } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, DeviceId, OrganizationId, Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, DefaultHttpOptions, errorify, Instance, stringify, transformAndValidate } from '@dogu-tech/common';
import { DeviceRuntimeInfoSubscribe, RuntimeInfoDto } from '@dogu-tech/device-client';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import WebSocket from 'ws';
import { ConsoleClientService } from '../console-client/console-client.service';
import { DeviceAuthService } from '../device-auth/device-auth.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { DeviceWebSocketMap } from '../types';
import { OnDeviceRegisteredEvent } from './device.events';
import { DeviceRegistry } from './device.registry';

@Injectable()
export class DeviceRuntimeInfoSubscriber {
  constructor(
    private readonly logger: DoguLogger,
    private readonly consoleClientService: ConsoleClientService,
    private readonly deviceRegistry: DeviceRegistry,
    private readonly authService: DeviceAuthService,
  ) {}

  @OnEvent(OnDeviceRegisteredEvent.key)
  onDeviceRegistered(value: Instance<typeof OnDeviceRegisteredEvent.value>): void {
    const { organizationId, deviceId, serial } = value;
    this.registerWebSocket(value.webSocketMap, organizationId, deviceId, serial);
  }

  private registerWebSocket(webSocketMap: DeviceWebSocketMap, organizationId: OrganizationId, deviceId: DeviceId, serial: Serial): void {
    const webSocket = this.subscribeRuntimeInfo(organizationId, deviceId, serial);
    webSocketMap.register(DeviceRuntimeInfoSubscriber.name, webSocket, {
      onUnregister: (webSocket) => {
        closeWebSocketWithTruncateReason(webSocket, 1000, 'Device disconnected');
      },
    });
  }

  private subscribeRuntimeInfo(organizationId: OrganizationId, deviceId: DeviceId, serial: Serial): WebSocket {
    const webSocket = new WebSocket(`ws://${env.DOGU_DEVICE_SERVER_HOST_PORT}${DeviceRuntimeInfoSubscribe.path}`, { headers: this.authService.makeAuthHeader() });
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
      const registryValue = this.deviceRegistry.get(serial);
      if (registryValue) {
        registryValue.webSocketMap.unregister(DeviceRuntimeInfoSubscriber.name);
        this.registerWebSocket(registryValue.webSocketMap, organizationId, deviceId, serial);
      }
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
    await this.consoleClientService.client
      .post(path, requestBody, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      })
      .catch((error) => {
        this.logger.error('writeDeviceRunTimeInfos.error', { error: errorify(error) });
      });
  }
}
