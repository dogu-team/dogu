import { PrivateDevice, WebSocketProxyId, WebSocketProxyReceiveValue } from '@dogu-private/console-host-agent';
import { createConsoleApiAuthHeader, DeviceId, OrganizationId } from '@dogu-private/types';
import { DefaultHttpOptions, errorify, Instance } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConsoleClientService } from '../console-client/console-client.service';
import { env } from '../env';
import { DoguLogger } from '../logger/logger';
import { OnWebSocketProxyCloseEvent, OnWebSocketProxyErrorEvent, OnWebSocketProxyMessageEvent, OnWebSocketProxyOpenEvent } from './web-socket-proxy.events';

@Injectable()
export class WebSocketProxyEventPusher {
  constructor(
    private readonly consoleClientService: ConsoleClientService,
    private readonly logger: DoguLogger,
  ) {}

  @OnEvent(OnWebSocketProxyOpenEvent.key)
  async onWebSocketProxyOpen(value: Instance<typeof OnWebSocketProxyOpenEvent.value>): Promise<void> {
    const { organizationId, deviceId, webSocketProxyId } = value;
    await this.sendWebSocketProxyReceive(organizationId, deviceId, webSocketProxyId, {
      kind: 'WebSocketProxyReceiveOpen',
    });
  }

  @OnEvent(OnWebSocketProxyCloseEvent.key)
  async onWebSocketProxyClose(value: Instance<typeof OnWebSocketProxyCloseEvent.value>): Promise<void> {
    const { organizationId, deviceId, webSocketProxyId, code, reason } = value;
    await this.sendWebSocketProxyReceive(organizationId, deviceId, webSocketProxyId, {
      kind: 'WebSocketProxyReceiveClose',
      code,
      reason,
    });
  }

  @OnEvent(OnWebSocketProxyErrorEvent.key)
  async onWebSocketProxyError(value: Instance<typeof OnWebSocketProxyErrorEvent.value>): Promise<void> {
    const { organizationId, deviceId, webSocketProxyId, error, message } = value;
    await this.sendWebSocketProxyReceive(organizationId, deviceId, webSocketProxyId, {
      kind: 'WebSocketProxyReceiveError',
      error,
      message,
    });
  }

  @OnEvent(OnWebSocketProxyMessageEvent.key)
  async onWebSocketProxyMessage(value: Instance<typeof OnWebSocketProxyMessageEvent.value>): Promise<void> {
    const { organizationId, deviceId, webSocketProxyId, data } = value;
    await this.sendWebSocketProxyReceive(organizationId, deviceId, webSocketProxyId, {
      kind: 'WebSocketProxyReceiveMessage',
      data,
    });
  }

  private async sendWebSocketProxyReceive(
    organizationId: OrganizationId,
    deviceId: DeviceId,
    deviceWebSocketid: WebSocketProxyId,
    value: WebSocketProxyReceiveValue,
  ): Promise<void> {
    const pathProvider = new PrivateDevice.pushWebSocketProxyReceive.pathProvider(organizationId, deviceId, deviceWebSocketid);
    const path = PrivateDevice.pushWebSocketProxyReceive.resolvePath(pathProvider);
    const requestBody: Instance<typeof PrivateDevice.pushWebSocketProxyReceive.requestBody> = {
      kind: 'WebSocketProxyReceive',
      value,
    };
    await this.consoleClientService.client
      .post<Instance<typeof PrivateDevice.pushWebSocketProxyReceive.requestBody>>(path, requestBody, {
        ...createConsoleApiAuthHeader(env.DOGU_HOST_TOKEN),
        timeout: DefaultHttpOptions.request.timeout,
      })
      .catch((error) => {
        this.logger.error('Failed to send web socket proxy receive', {
          organizationId,
          deviceId,
          deviceWebSocketid,
          value,
          error: errorify(error),
        });
        throw error;
      });
  }
}
