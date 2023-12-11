import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, errorify, Instance, loop } from '@dogu-tech/common';
import { DeviceWebSocketRelay, DoguDeviceWebSocketRelaySerialHeader, DoguDeviceWebSocketRelayUrlHeader } from '@dogu-tech/device-client-common';
import { IncomingHttpHeaders, IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DeviceChannel } from '../../internal/public/device-channel';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

interface Value {
  toWebSocket: WebSocket | null;
}

@WebSocketService(DeviceWebSocketRelay)
export class DeviceWebSocketRelayService
  extends WebSocketGatewayBase<Value, typeof DeviceWebSocketRelay.sendMessage, typeof DeviceWebSocketRelay.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceWebSocketRelay.sendMessage, typeof DeviceWebSocketRelay.receiveMessage>, OnWebSocketClose<Value>
{
  constructor(
    private readonly logger: DoguLogger,
    private readonly scanService: ScanService,
  ) {
    super(DeviceWebSocketRelay, logger);
  }

  override async onWebSocketOpen(fromWebSocket: WebSocket, incommingMessage: IncomingMessage): Promise<Value> {
    const { headers } = incommingMessage;
    this.logger.info(`DeviceWebSocketRelayWebsocketService.onWebSocketOpen`, { headers });
    const { serial, url } = this.parseHeaders(headers);

    const deviceChannel = this.scanService.findChannel(serial);
    if (!deviceChannel) {
      throw new Error('device channel not found');
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
        const message: Instance<typeof DeviceWebSocketRelay.receiveMessage> = {
          data: stringified,
        };
        fromWebSocket.send(JSON.stringify(message));
      });
    });

    return {
      toWebSocket,
    };
  }

  private parseHeaders(headers: IncomingHttpHeaders): { serial: string; url: string } {
    const serial = headers[DoguDeviceWebSocketRelaySerialHeader];
    if (!serial) {
      throw new Error('dogu-websocket-relay-serial header is required');
    }

    if (Array.isArray(serial)) {
      throw new Error('dogu-websocket-relay-serial header must be single value');
    }

    const url = headers[DoguDeviceWebSocketRelayUrlHeader];
    if (!url) {
      throw new Error('dogu-websocket-relay-url header is required');
    }

    if (Array.isArray(url)) {
      throw new Error('dogu-websocket-relay-url header must be single value');
    }

    return {
      serial,
      url,
    };
  }

  onWebSocketMessage(fromWebSocket: WebSocket, message: Instance<typeof DeviceWebSocketRelay.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    try {
      this.onWebSocketMessageInternal(fromWebSocket, message, valueAccessor);
    } catch (error) {
      this.logger.error('onWebSocketMessageInternal error', { error: errorify(error) });
    }
  }

  private onWebSocketMessageInternal(
    fromWebSocket: WebSocket,
    message: Instance<typeof DeviceWebSocketRelay.sendMessage>,
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

  private async waitDevicePortListening(deviceChannel: DeviceChannel, port: number): Promise<void> {
    for await (const _ of loop(1000, 10)) {
      if (await deviceChannel.isPortListening(port)) {
        break;
      }
    }
    if (!(await deviceChannel.isPortListening(port))) {
      throw new Error(`port:${port} is not listening`);
    }
  }
}
