import { WebSocketProxyConnect, WebSocketProxyId, WebSocketProxySendClose, WebSocketProxySendMessage } from '@dogu-private/console-host-agent';
import { DeviceId, OrganizationId } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, errorify, Instance, stringify, validateAndEmitEventAsync } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import WebSocket from 'ws';
import { env } from '../env';
import { OnHostDisconnectedEvent } from '../host/host.events';
import { DoguLogger } from '../logger/logger';
import { MessageCanceler, MessageContext } from '../message/message.types';
import { OnWebSocketProxyCloseEvent, OnWebSocketProxyErrorEvent, OnWebSocketProxyMessageEvent, OnWebSocketProxyOpenEvent } from './web-socket-proxy.events';

interface WebSocketProxyInfo {
  webSocket: WebSocket;
  organizationId: OrganizationId;
  deviceId: DeviceId;
  webSocketProxyId: string;
}

@Injectable()
export class WebSocketProxyProcessRegistry {
  private readonly webSockets = new Map<WebSocketProxyId, WebSocketProxyInfo>();

  constructor(private readonly logger: DoguLogger, private readonly eventEmitter: EventEmitter2) {}

  @OnEvent(OnHostDisconnectedEvent.key)
  onHostDisconnected(value: Instance<typeof OnHostDisconnectedEvent.value>): void {
    this.webSockets.forEach((webSocketProxyInfo, WebSocketProxyId) => {
      const { webSocket } = webSocketProxyInfo;
      closeWebSocketWithTruncateReason(webSocket, 1001, 'Host disconnected');
    });
    this.webSockets.clear();
  }

  async connect(param: WebSocketProxyConnect, context: MessageContext): Promise<void> {
    const { webSocketProxyId, path, headers } = param;
    const { info, eventHandler } = context;
    const { deviceId, organizationId } = info;
    const webSocket = new WebSocket(`ws://${env.DOGU_DEVICE_SERVER_HOST_PORT}${path}`, { headers });
    const webSocketProxyInfo: WebSocketProxyInfo = { webSocket, organizationId, deviceId, webSocketProxyId };
    this.webSockets.set(webSocketProxyId, webSocketProxyInfo);
    const canceler: MessageCanceler = {
      cancel: () => {
        this.webSockets.delete(webSocketProxyId);
        closeWebSocketWithTruncateReason(webSocket, 1001, 'Message canceled');
      },
    };

    webSocket.on('open', (event: WebSocket.Event) => {
      validateAndEmitEventAsync(this.eventEmitter, OnWebSocketProxyOpenEvent, {
        organizationId,
        deviceId,
        webSocketProxyId,
      }).catch((error) => {
        this.logger.error('OnWebSocketProxyOpenEvent', { error: errorify(error) });
      });
    });
    let errorOccurred: unknown | null = null;
    webSocket.on('error', (event: WebSocket.ErrorEvent) => {
      errorOccurred = event.error;
      validateAndEmitEventAsync(this.eventEmitter, OnWebSocketProxyErrorEvent, {
        organizationId,
        deviceId,
        webSocketProxyId,
        error: errorOccurred,
        message: stringify(errorOccurred),
      }).catch((error) => {
        this.logger.error('OnWebSocketProxyErrorEvent', { error: errorify(error) });
      });
    });
    webSocket.addEventListener('close', (event: WebSocket.CloseEvent) => {
      this.webSockets.delete(webSocketProxyId);
      if (errorOccurred !== null) {
        validateAndEmitEventAsync(this.eventEmitter, OnWebSocketProxyCloseEvent, {
          organizationId,
          deviceId,
          webSocketProxyId,
          code: 1001,
          reason: stringify(errorOccurred),
        }).catch((error) => {
          this.logger.error('OnWebSocketProxyCloseEvent', { error: errorify(error) });
        });
      } else {
        const { code, reason } = event;
        validateAndEmitEventAsync(this.eventEmitter, OnWebSocketProxyCloseEvent, {
          organizationId,
          deviceId,
          webSocketProxyId,
          code: code === 0 ? 1000 : code,
          reason: reason,
        }).catch((error) => {
          this.logger.error('OnWebSocketProxyCloseEvent', { error: errorify(error) });
        });
      }
    });
    webSocket.addEventListener('message', (event: WebSocket.MessageEvent) => {
      const { data } = event;
      validateAndEmitEventAsync(this.eventEmitter, OnWebSocketProxyMessageEvent, {
        organizationId,
        deviceId,
        webSocketProxyId,
        data: data.toString(),
      }).catch((error) => {
        this.logger.error('OnWebSocketProxyMessageEvent', { error: errorify(error) });
      });
    });
    await eventHandler.onCancelerCreated(canceler);
  }

  sendMessage(param: WebSocketProxySendMessage, context: MessageContext): void {
    const { webSocketProxyId, data } = param;
    const webSocketProxyInfo = this.webSockets.get(webSocketProxyId);
    if (webSocketProxyInfo === undefined) {
      throw new Error(`Device webSocket not found. ${webSocketProxyId}`);
    }
    const { webSocket } = webSocketProxyInfo;
    const { info } = context;
    const { deviceId, organizationId } = info;
    webSocket.send(data, (error) => {
      if (error !== undefined) {
        validateAndEmitEventAsync(this.eventEmitter, OnWebSocketProxyErrorEvent, {
          organizationId,
          deviceId,
          webSocketProxyId,
          error: error,
          message: stringify(error),
        }).catch((error) => {
          this.logger.error('OnWebSocketProxyErrorEvent', { error: errorify(error) });
        });
        validateAndEmitEventAsync(this.eventEmitter, OnWebSocketProxyCloseEvent, {
          organizationId,
          deviceId,
          webSocketProxyId,
          code: 1001,
          reason: stringify(error),
        }).catch((error) => {
          this.logger.error('OnWebSocketProxyCloseEvent', { error: errorify(error) });
        });
      }
    });
  }

  close(param: WebSocketProxySendClose, context: MessageContext): void {
    const { webSocketProxyId } = param;
    const webSocketProxyInfo = this.webSockets.get(webSocketProxyId);
    if (webSocketProxyInfo === undefined) {
      throw new Error(`Device webSocket not found. ${webSocketProxyId}`);
    }
    const { webSocket } = webSocketProxyInfo;
    closeWebSocketWithTruncateReason(webSocket, 1000, 'Close requested');
  }
}
