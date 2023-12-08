import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { Serial } from '@dogu-private/types';
import { errorify, Instance } from '@dogu-tech/common';
import { DeviceRunAppiumServer } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { AppiumRemoteContextRental } from '../../appium/appium.context.proxy';
import { WebsocketHeaderPermission, WebsocketIncomingMessage } from '../../auth/guard/websocket.guard';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

interface Value {
  serial: Serial;
  rental: AppiumRemoteContextRental | null;
}

@WebSocketService(DeviceRunAppiumServer)
export class DeviceRunAppiumServerService
  extends WebSocketGatewayBase<Value, typeof DeviceRunAppiumServer.sendMessage, typeof DeviceRunAppiumServer.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceRunAppiumServer.sendMessage, typeof DeviceRunAppiumServer.receiveMessage>, OnWebSocketClose<Value>
{
  constructor(
    private readonly scanService: ScanService,
    private readonly logger: DoguLogger,
  ) {
    super(DeviceRunAppiumServer, logger);
  }

  @WebsocketHeaderPermission({ allowAdmin: true, allowTemporary: 'serial' })
  override onWebSocketOpen(webSocket: WebSocket, @WebsocketIncomingMessage() incommingMessage: IncomingMessage): Value {
    return { serial: '', rental: null };
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceRunAppiumServer.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { serial } = message;
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${serial} not found`);
    }
    try {
      const rental = await deviceChannel.rentAppiumRemoteContext('DeviceRunAppiumServerService');
      this.send(webSocket, {
        value: {
          kind: 'DeviceRunAppiumServerReceiveMessageResultValue',
          success: true,
          serverPort: rental.context.getInfo().server.port,
        },
      });
      valueAccessor.update({ serial, rental });
    } catch (e) {
      this.send(webSocket, {
        value: {
          kind: 'DeviceRunAppiumServerReceiveMessageResultValue',
          success: false,
          serverPort: 0,
          reason: errorify(e),
        },
      });
    }
  }

  async onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { serial, rental } = valueAccessor.get();
    if (serial.length === 0) {
      return;
    }
    if (!rental) {
      return;
    }
    await rental.release();
  }
}
