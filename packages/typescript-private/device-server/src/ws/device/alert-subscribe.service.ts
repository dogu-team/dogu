import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { DeviceAlert } from '@dogu-private/types';
import { AsyncClosable, Instance } from '@dogu-tech/common';
import { DeviceAlertSubscribe } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

interface Value {
  closer: AsyncClosable | null;
}

@WebSocketService(DeviceAlertSubscribe)
export class DeviceAlertSubscribeService
  extends WebSocketGatewayBase<Value, typeof DeviceAlertSubscribe.sendMessage, typeof DeviceAlertSubscribe.receiveMessage>
  implements OnWebSocketClose<Value>, OnWebSocketMessage<Value, typeof DeviceAlertSubscribe.sendMessage, typeof DeviceAlertSubscribe.receiveMessage>
{
  constructor(
    private readonly scanService: ScanService,
    private readonly logger: DoguLogger,
  ) {
    super(DeviceAlertSubscribe, logger);
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
      closer.close().catch((e) => {
        this.logger.error(e);
      });
      valueAccessor.update({
        closer: null,
      });
    }
  }

  onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    this.clearClosable(valueAccessor);
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceAlertSubscribe.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { serial } = message;
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${serial} not found`);
    }

    this.clearClosable(valueAccessor);

    function send(alert: DeviceAlert): void {
      const receiveMessage: Instance<typeof DeviceAlertSubscribe.receiveMessage> = {
        title: alert.title,
      };
      webSocket.send(JSON.stringify(receiveMessage));
    }

    const closer = await deviceChannel.subscribeAlert((alert) => {
      send(alert);
    });
    valueAccessor.update({
      closer,
    });
  }
}
