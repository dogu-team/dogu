import { OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, Instance, LogLevel, stringify } from '@dogu-tech/common';
import { DeviceInstallApp } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

@WebSocketService(DeviceInstallApp)
export class DeviceInstallAppService
  extends WebSocketGatewayBase<null, typeof DeviceInstallApp.sendMessage, typeof DeviceInstallApp.receiveMessage>
  implements OnWebSocketMessage<null, typeof DeviceInstallApp.sendMessage, typeof DeviceInstallApp.receiveMessage>
{
  constructor(private readonly scanService: ScanService, private readonly logger: DoguLogger) {
    super(DeviceInstallApp, logger);
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): null {
    return null;
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceInstallApp.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<null>): Promise<void> {
    const { serial, appPath } = message;
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${serial} not found`);
    }
    await deviceChannel.installApp(appPath, {
      error: (message, details) => {
        this.send(webSocket, this.createMessage('error', stringify(message), details));
      },
      info: (message, details) => {
        this.send(webSocket, this.createMessage('info', stringify(message), details));
      },
    });
    closeWebSocketWithTruncateReason(webSocket, 1000, 'App installed');
  }

  private createMessage(level: LogLevel, message: string, details?: Record<string, unknown>): Instance<typeof DeviceInstallApp.receiveMessage> {
    const result: Instance<typeof DeviceInstallApp.receiveMessage> = {
      level,
      message,
      details,
      localTimeStamp: new Date().toISOString(),
    };
    return result;
  }
}
