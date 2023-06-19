import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { Closable, Instance, LogLevel, stringify } from '@dogu-tech/common';
import { DeviceLogSubscribe } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

interface Value {
  closer: Closable | null;
}

@WebSocketService(DeviceLogSubscribe)
export class DeviceLogSubscribeService
  extends WebSocketGatewayBase<Value, typeof DeviceLogSubscribe.sendMessage, typeof DeviceLogSubscribe.receiveMessage>
  implements OnWebSocketClose<Value>, OnWebSocketMessage<Value, typeof DeviceLogSubscribe.sendMessage, typeof DeviceLogSubscribe.receiveMessage>
{
  constructor(private readonly scanService: ScanService, private readonly logger: DoguLogger) {
    super(DeviceLogSubscribe, logger);
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): Value {
    return {
      closer: null,
    };
  }

  private clearClosable(valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const value = valueAccessor.get();
    if (value.closer !== null) {
      const { closer } = value;
      closer.close();
      valueAccessor.update({
        closer: null,
      });
    }
  }

  onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    this.clearClosable(valueAccessor);
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceLogSubscribe.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { serial, args } = message;
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${serial} not found`);
    }

    this.clearClosable(valueAccessor);

    function send(level: LogLevel, message: unknown, details?: Record<string, unknown>): void {
      const receiveMessage: Instance<typeof DeviceLogSubscribe.receiveMessage> = {
        level,
        message: stringify(message),
        details,
        localTimeStamp: new Date().toISOString(),
      };
      webSocket.send(JSON.stringify(receiveMessage));
    }

    const closer = await deviceChannel.subscribeLog(args, {
      error(message, details) {
        send('error', message, details);
      },
      info(message, details) {
        send('info', message, details);
      },
    });
    valueAccessor.update({
      closer,
    });
  }
}
