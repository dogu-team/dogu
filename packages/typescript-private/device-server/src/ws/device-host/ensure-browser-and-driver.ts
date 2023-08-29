import { OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, errorify, Instance } from '@dogu-tech/common';
import { DeviceHostEnsureBrowserAndDriver } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { BrowserManagerService } from '../../browser-manager/browser-manager.service';
import { DoguLogger } from '../../logger/logger';

type Value = null;

const successCloseTimeout = 3_000;

@WebSocketService(DeviceHostEnsureBrowserAndDriver)
export class DeviceHostEnsureBrowserAndDriverService
  extends WebSocketGatewayBase<Value, typeof DeviceHostEnsureBrowserAndDriver.sendMessage, typeof DeviceHostEnsureBrowserAndDriver.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceHostEnsureBrowserAndDriver.sendMessage, typeof DeviceHostEnsureBrowserAndDriver.receiveMessage>
{
  constructor(private readonly logger: DoguLogger, private readonly browserManagerService: BrowserManagerService) {
    super(DeviceHostEnsureBrowserAndDriver, logger);
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): Value {
    return null;
  }

  async onWebSocketMessage(
    webSocket: WebSocket,
    message: Instance<typeof DeviceHostEnsureBrowserAndDriver.sendMessage>,
    valueAccessor: WebSocketRegistryValueAccessor<Value>,
  ): Promise<void> {
    try {
      await this.onMessage(webSocket, message, valueAccessor);
    } catch (error) {
      closeWebSocketWithTruncateReason(webSocket, 1001, 'Failed to ensure');
    }
  }

  private async onMessage(
    webSocket: WebSocket,
    message: Instance<typeof DeviceHostEnsureBrowserAndDriver.sendMessage>,
    valueAccessor: WebSocketRegistryValueAccessor<Value>,
  ): Promise<void> {
    const ensuredBrowserAndDriverInfo = await this.browserManagerService.ensureBrowserAndDriver(message);
    const receiveMessage: Instance<typeof DeviceHostEnsureBrowserAndDriver.receiveMessage> = ensuredBrowserAndDriverInfo;
    webSocket.send(JSON.stringify(receiveMessage), (error) => {
      if (error) {
        const casted = errorify(error);
        this.logger.error('EnsureBrowserAndDriver receive send error', { error: casted });
        closeWebSocketWithTruncateReason(webSocket, 1001, casted.message);
      } else {
        setTimeout(() => {
          closeWebSocketWithTruncateReason(webSocket, 1000, 'Success');
        }, successCloseTimeout);
      }
    });
  }
}
