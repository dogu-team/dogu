import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, errorify, Instance } from '@dogu-tech/common';
import { DeviceHostWebSocketRelay, DoguDeviceHostWebSocketRelayUrlHeader } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';

interface Value {
  toWebSocket: WebSocket | null;
}

@WebSocketService(DeviceHostWebSocketRelay)
export class DeviceHostWebSocketRelayWebsocketService
  extends WebSocketGatewayBase<Value, typeof DeviceHostWebSocketRelay.sendMessage, typeof DeviceHostWebSocketRelay.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceHostWebSocketRelay.sendMessage, typeof DeviceHostWebSocketRelay.receiveMessage>, OnWebSocketClose<Value>
{
  constructor(private readonly logger: DoguLogger) {
    super(DeviceHostWebSocketRelay, logger);
  }

  override async onWebSocketOpen(fromWebSocket: WebSocket, incommingMessage: IncomingMessage): Promise<Value> {
    const url = incommingMessage.headers[DoguDeviceHostWebSocketRelayUrlHeader];
    if (!url) {
      throw new Error('dogu-websocket-relay-url header is required');
    }

    if (Array.isArray(url)) {
      throw new Error('dogu-websocket-relay-url header must be single value');
    }

    const toWebSocket = await new Promise<WebSocket>((resolve, reject) => {
      const toWebSocket = new WebSocket(url);

      const onErrorForReject = (error: Error): void => {
        this.logger.verbose('toWebSocket open error', { url, error: errorify(error) });
        reject(error);
      };
      toWebSocket.on('error', onErrorForReject);

      toWebSocket.on('open', () => {
        toWebSocket.off('error', onErrorForReject);
        toWebSocket.on('error', (error) => {
          this.logger.verbose('toWebSocket error', { url, error: errorify(error) });
        });

        this.logger.verbose('toWebSocket open', { url });
        resolve(toWebSocket);
      });

      toWebSocket.on('close', (code, reason) => {
        this.logger.verbose('toWebSocket close', { url, code, reason: reason.toString() });
        try {
          closeWebSocketWithTruncateReason(fromWebSocket, code, reason);
        } catch (error) {
          this.logger.error('closeWebSocketWithTruncateReason error', { error: errorify(error) });
        }
      });
      toWebSocket.on('message', (data) => {
        const stringified = data.toString();
        this.logger.verbose('toWebSocket message', { url, data: stringified });
        const message: Instance<typeof DeviceHostWebSocketRelay.receiveMessage> = {
          data: stringified,
        };
        fromWebSocket.send(JSON.stringify(message));
      });
    });

    return {
      toWebSocket,
    };
  }

  onWebSocketMessage(fromWebSocket: WebSocket, message: Instance<typeof DeviceHostWebSocketRelay.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    try {
      this.onWebSocketMessageInternal(fromWebSocket, message, valueAccessor);
    } catch (error) {
      this.logger.error('onWebSocketMessageInternal error', { error: errorify(error) });
    }
  }

  private onWebSocketMessageInternal(
    fromWebSocket: WebSocket,
    message: Instance<typeof DeviceHostWebSocketRelay.sendMessage>,
    valueAccessor: WebSocketRegistryValueAccessor<Value>,
  ): void {
    const { toWebSocket } = valueAccessor.get();
    if (toWebSocket) {
      toWebSocket.send(message.data);
    }
  }

  onWebSocketClose(fromWebSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const { code, reason } = event;
    const { toWebSocket } = valueAccessor.get();
    if (toWebSocket) {
      closeWebSocketWithTruncateReason(toWebSocket, code, reason);
    }
    valueAccessor.update({
      toWebSocket: null,
    });
  }
}
