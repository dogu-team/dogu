import { OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, delay, errorify, Instance } from '@dogu-tech/common';
import { DeviceReset } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

@WebSocketService(DeviceReset)
export class DeviceResetService
  extends WebSocketGatewayBase<null, typeof DeviceReset.sendMessage, typeof DeviceReset.receiveMessage>
  implements OnWebSocketMessage<null, typeof DeviceReset.sendMessage, typeof DeviceReset.receiveMessage>
{
  constructor(private readonly logger: DoguLogger, private readonly scanService: ScanService) {
    super(DeviceReset, logger);
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): null {
    return null;
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceReset.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<null>): Promise<void> {
    try {
      const { serial } = message;
      const channel = this.scanService.findChannel(serial);
      if (!channel) {
        closeWebSocketWithTruncateReason(webSocket, 1001, 'Channel not found');
        return;
      }
      await channel.reset();
      /**
       * @note channel is invalid after reset
       */
      await delay(3 * 60 * 1000);
      for (let tryCount = 0; tryCount < 10; tryCount++) {
        const channel = this.scanService.findChannel(serial);
        if (channel) {
          this.logger.info('Reset finished', { serial });
          closeWebSocketWithTruncateReason(webSocket, 1000, 'Reset finished');
          return;
        } else {
          await delay(60 * 1000);
          continue;
        }
      }
      closeWebSocketWithTruncateReason(webSocket, 1001, 'Reset failed');
    } catch (error) {
      this.logger.error('DeviceResetService.onWebSocketMessage', { error: errorify(error) });
      closeWebSocketWithTruncateReason(webSocket, 1001, errorify(error).message);
    }
  }
}
