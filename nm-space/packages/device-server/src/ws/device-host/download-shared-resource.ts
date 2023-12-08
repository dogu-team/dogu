import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, DefaultHttpOptions, errorify, Instance, Retry, setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { DeviceHostDownloadSharedResource } from '@dogu-tech/device-client-common';
import axios from 'axios';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { WebsocketHeaderPermission, WebsocketIncomingMessage } from '../../auth/guard/websocket.guard';
import { DeviceHostDownloadSharedResourceService } from '../../device-host/device-host.download-shared-resource';
import { DoguLogger } from '../../logger/logger';

interface Value {
  listenerss: Map<string, WebSocket[]>;
}

@WebSocketService(DeviceHostDownloadSharedResource)
export class DeviceHostDownloadSharedResourceWebSocketService
  extends WebSocketGatewayBase<Value, typeof DeviceHostDownloadSharedResource.sendMessage, typeof DeviceHostDownloadSharedResource.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceHostDownloadSharedResource.sendMessage, typeof DeviceHostDownloadSharedResource.receiveMessage>, OnWebSocketClose<Value>
{
  private readonly client = axios.create();

  constructor(
    private readonly downloadService: DeviceHostDownloadSharedResourceService,
    private readonly logger: DoguLogger,
  ) {
    super(DeviceHostDownloadSharedResource, logger);
    setAxiosErrorFilterToIntercepter(this.client);
  }

  @WebsocketHeaderPermission({ allowAdmin: true, allowTemporary: 'exist' })
  override onWebSocketOpen(webSocket: WebSocket, @WebsocketIncomingMessage() incommingMessage: IncomingMessage): Value {
    return { listenerss: new Map<string, WebSocket[]>() };
  }

  async onWebSocketMessage(
    webSocket: WebSocket,
    message: Instance<typeof DeviceHostDownloadSharedResource.sendMessage>,
    valueAccessor: WebSocketRegistryValueAccessor<Value>,
  ): Promise<void> {
    try {
      await this.onMessage(webSocket, message, valueAccessor);
    } catch (error) {
      this.logger.error('File download failed', { error: errorify(error) });
      closeWebSocketWithTruncateReason(webSocket, 1001, 'File download failed');
    }
  }

  @Retry({ retryCount: 3, retryInterval: 1000 })
  private async getFileSize(url: string, headers: Record<string, string> | undefined): Promise<number> {
    const response = await this.client
      .head(url, {
        headers,
        timeout: DefaultHttpOptions.request.timeout,
      })
      .catch((error) => {
        throw error;
      });
    const contentLength = response.headers['Content-Length'] as string | undefined;
    if (typeof contentLength === 'string') {
      return Number(contentLength);
    }
    throw new Error('content-length is not string');
  }

  private async onMessage(
    webSocket: WebSocket,
    message: Instance<typeof DeviceHostDownloadSharedResource.sendMessage>,
    valueAccessor: WebSocketRegistryValueAccessor<Value>,
  ): Promise<void> {
    const result = await this.downloadService.queueDownload(message);

    const receiveMessageSerialized = JSON.stringify(result);
    webSocket.send(receiveMessageSerialized);
    closeWebSocketWithTruncateReason(webSocket, 1000, result.message);
  }

  onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const { listenerss } = valueAccessor.get();
    for (const [filePath, listeners] of listenerss) {
      const index = listeners.indexOf(webSocket);
      if (index !== -1) {
        listeners.splice(index, 1);
        if (listeners.length === 0) {
          listenerss.delete(filePath);
        }
        return;
      }
    }
  }
}
