import { OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, errorify, Instance } from '@dogu-tech/common';
import { DeviceJoinWifi } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

@WebSocketService(DeviceJoinWifi)
export class DeviceJoinWifiService
  extends WebSocketGatewayBase<null, typeof DeviceJoinWifi.sendMessage, typeof DeviceJoinWifi.receiveMessage>
  implements OnWebSocketMessage<null, typeof DeviceJoinWifi.sendMessage, typeof DeviceJoinWifi.receiveMessage>
{
  constructor(private readonly logger: DoguLogger, private readonly scanService: ScanService) {
    super(DeviceJoinWifi, logger);
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): null {
    return null;
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceJoinWifi.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<null>): Promise<void> {
    try {
      const { serial, ssid, password } = message;
      const channel = this.scanService.findChannel(serial);
      if (!channel) {
        closeWebSocketWithTruncateReason(webSocket, 1001, 'Channel not found');
        return;
      }
      await channel.joinWifi(ssid, password);
      closeWebSocketWithTruncateReason(webSocket, 1000, 'Join wifi finished');
    } catch (error) {
      this.logger.error('DeviceJoinWifiService.onWebSocketMessage', { error: errorify(error) });
      closeWebSocketWithTruncateReason(webSocket, 1001, errorify(error).message);
    }
  }
}
