import { OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, errorify, Instance } from '@dogu-tech/common';
import { DeviceStreaming } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

@WebSocketService(DeviceStreaming)
export class DeviceStreamingService
  extends WebSocketGatewayBase<null, typeof DeviceStreaming.sendMessage, typeof DeviceStreaming.receiveMessage>
  implements OnWebSocketMessage<null, typeof DeviceStreaming.sendMessage, typeof DeviceStreaming.receiveMessage>
{
  constructor(private readonly scanService: ScanService, private readonly logger: DoguLogger) {
    super(DeviceStreaming, logger);
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): null {
    return null;
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceStreaming.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<null>): Promise<void> {
    const { serial, value } = message;
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${message.serial} not found`);
    }

    const { $case } = value;
    if ($case === 'startStreaming') {
      const observable = await deviceChannel.startStreamingWebRtcWithTrickle(message);
      observable.subscribe({
        next: (result) => {
          this.logger.verbose('DeviceStreamingGateway', { result });
          webSocket.send(JSON.stringify(result));
        },
        error: (error) => {
          this.logger.error('DeviceStreamingGateway', { error: errorify(error) });
          closeWebSocketWithTruncateReason(webSocket, 1001, 'Streaming failed');
        },
        complete: () => {
          this.logger.verbose('DeviceStreamingGateway', { complete: true });
          closeWebSocketWithTruncateReason(webSocket, 1000, 'Streaming started');
        },
      });
    }
  }
}
