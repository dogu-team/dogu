import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, errorify, Instance } from '@dogu-tech/common';
import { DeviceHostWebSocketRelay, DoguDeviceHostWebSocketRelayUrlHeader } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';

interface Value {
  targetWebSocket: WebSocket | null;
}

@WebSocketService(DeviceHostWebSocketRelay)
export class DeviceHostWebSocketRelayWebsocketService
  extends WebSocketGatewayBase<Value, typeof DeviceHostWebSocketRelay.sendMessage, typeof DeviceHostWebSocketRelay.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceHostWebSocketRelay.sendMessage, typeof DeviceHostWebSocketRelay.receiveMessage>, OnWebSocketClose<Value>
{
  constructor(private readonly logger: DoguLogger) {
    super(DeviceHostWebSocketRelay, logger);
  }

  override async onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): Promise<Value> {
    const url = incommingMessage.headers[DoguDeviceHostWebSocketRelayUrlHeader];
    if (!url) {
      throw new Error('dogu-websocket-relay-url header is required');
    }

    if (Array.isArray(url)) {
      throw new Error('dogu-websocket-relay-url header must be single value');
    }

    const targetWebSocket = await new Promise<WebSocket>((resolve, reject) => {
      const targetWebSocket = new WebSocket(url);

      const onErrorForReject = (error: Error) => {
        this.logger.verbose('targetWebSocket open error', { url, error: errorify(error) });
        reject(error);
      };
      targetWebSocket.on('error', onErrorForReject);

      targetWebSocket.on('open', () => {
        targetWebSocket.off('error', onErrorForReject);
        targetWebSocket.on('error', (error) => {
          this.logger.verbose('targetWebSocket error', { url, error: errorify(error) });
        });

        this.logger.verbose('targetWebSocket open', { url });
        resolve(targetWebSocket);
      });

      targetWebSocket.on('close', (code, reason) => {
        this.logger.verbose('targetWebSocket close', { url, code, reason });
        closeWebSocketWithTruncateReason(webSocket, code, reason);
      });
      targetWebSocket.on('message', (data) => {
        this.logger.verbose('targetWebSocket message', { url, data });
        const message: Instance<typeof DeviceHostWebSocketRelay.receiveMessage> = {
          data: data.toString(),
        };
        webSocket.send(JSON.stringify(message));
      });
    });

    return {
      targetWebSocket,
    };
  }

  async onWebSocketMessage(
    webSocket: WebSocket,
    message: Instance<typeof DeviceHostWebSocketRelay.sendMessage>,
    valueAccessor: WebSocketRegistryValueAccessor<Value>,
  ): Promise<void> {
    try {
      await this.onWebSocketMessageInternal(webSocket, message, valueAccessor);
    } catch (error) {
      this.logger.error('onWebSocketMessageInternal error', { error: errorify(error) });
    }
  }

  private async onWebSocketMessageInternal(
    webSocket: WebSocket,
    message: Instance<typeof DeviceHostWebSocketRelay.sendMessage>,
    valueAccessor: WebSocketRegistryValueAccessor<Value>,
  ): Promise<void> {
    const { targetWebSocket } = valueAccessor.get();
    if (targetWebSocket) {
      targetWebSocket.send(message.data);
    }
  }

  onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const { code, reason } = event;
    const { targetWebSocket } = valueAccessor.get();
    if (targetWebSocket) {
      closeWebSocketWithTruncateReason(targetWebSocket, code, reason);
    }
    valueAccessor.update({
      targetWebSocket: null,
    });
  }
}
