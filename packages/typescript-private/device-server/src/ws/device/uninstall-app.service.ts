import { OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, Instance, LogLevel, stringify } from '@dogu-tech/common';
import { DeviceUninstallApp } from '@dogu-tech/device-client-common';
import { DateNano } from '@dogu-tech/node';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { AuthIncomingMessage, DeviceWsPermission } from '../../auth/guard/device.ws.guard';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

@WebSocketService(DeviceUninstallApp)
export class DeviceUninstallAppService
  extends WebSocketGatewayBase<null, typeof DeviceUninstallApp.sendMessage, typeof DeviceUninstallApp.receiveMessage>
  implements OnWebSocketMessage<null, typeof DeviceUninstallApp.sendMessage, typeof DeviceUninstallApp.receiveMessage>
{
  constructor(
    private readonly scanService: ScanService,
    private readonly logger: DoguLogger,
  ) {
    super(DeviceUninstallApp, logger);
  }

  @DeviceWsPermission({ allowAdmin: true, allowTemporary: 'serial' })
  override onWebSocketOpen(webSocket: WebSocket, @AuthIncomingMessage() incommingMessage: IncomingMessage): null {
    return null;
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceUninstallApp.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<null>): Promise<void> {
    const { serial, appPath } = message;
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${serial} not found`);
    }

    await deviceChannel.uninstallApp(appPath, {
      error: (message, details) => {
        this.logger.error(`DeviceUninstallAppService.onWebSocketMessage error`, { message, details });
        this.send(webSocket, this.createMessage('error', stringify(message), details));
      },
      info: (message, details) => {
        this.logger.info(`DeviceUninstallAppService.onWebSocketMessage info`, { message, details });
        this.send(webSocket, this.createMessage('info', stringify(message), details));
      },
    });
    closeWebSocketWithTruncateReason(webSocket, 1000, 'App uninstall');
  }

  private createMessage(level: LogLevel, message: string, details?: Record<string, unknown>): Instance<typeof DeviceUninstallApp.receiveMessage> {
    const result: Instance<typeof DeviceUninstallApp.receiveMessage> = {
      level,
      message,
      details,
      localTimeStampNano: new DateNano().toRFC3339Nano(),
    };
    return result;
  }
}
