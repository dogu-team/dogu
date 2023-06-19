import { OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, Instance, LogLevel, stringify } from '@dogu-tech/common';
import { DeviceRunApp } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

@WebSocketService(DeviceRunApp)
export class DeviceRunAppService
  extends WebSocketGatewayBase<null, typeof DeviceRunApp.sendMessage, typeof DeviceRunApp.receiveMessage>
  implements OnWebSocketMessage<null, typeof DeviceRunApp.sendMessage, typeof DeviceRunApp.receiveMessage>
{
  constructor(private readonly scanService: ScanService, private readonly logger: DoguLogger) {
    super(DeviceRunApp, logger);
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): null {
    return null;
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceRunApp.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<null>): Promise<void> {
    const deviceChannel = this.scanService.findChannel(message.serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${message.serial} not found`);
    }

    await deviceChannel.runApp(message.appPath, {
      error: (message, details) => {
        this.send(webSocket, this.createMessage('error', stringify(message), details));
      },
      info: (message, details) => {
        this.send(webSocket, this.createMessage('info', stringify(message), details));
      },
    });
    closeWebSocketWithTruncateReason(webSocket, 1000, 'App run');
  }

  private createMessage(level: LogLevel, message: string, details?: Record<string, unknown>): Instance<typeof DeviceRunApp.receiveMessage> {
    const result: Instance<typeof DeviceRunApp.receiveMessage> = {
      level,
      message,
      details,
      localTimeStamp: new Date().toISOString(),
    };
    return result;
  }
}
