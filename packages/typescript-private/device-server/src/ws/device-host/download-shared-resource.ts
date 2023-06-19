import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { closeWebSocketWithTruncateReason, DefaultHttpOptions, errorify, Instance, Retry } from '@dogu-tech/common';
import { DeviceHostDownloadSharedResource } from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import axios from 'axios';
import fs from 'fs';
import { IncomingMessage } from 'http';
import path from 'path';
import stream, { Stream } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';

interface Value {
  listenerss: Map<string, WebSocket[]>;
}

@WebSocketService(DeviceHostDownloadSharedResource)
export class DeviceHostDownloadSharedResourceService
  extends WebSocketGatewayBase<Value, typeof DeviceHostDownloadSharedResource.sendMessage, typeof DeviceHostDownloadSharedResource.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceHostDownloadSharedResource.sendMessage, typeof DeviceHostDownloadSharedResource.receiveMessage>, OnWebSocketClose<Value>
{
  constructor(private readonly logger: DoguLogger) {
    super(DeviceHostDownloadSharedResource, logger);
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): Value {
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
    const response = await axios
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
    const { filePath, url, expectedFileSize, headers } = message;
    const stat = await fs.promises.stat(filePath).catch(() => null);
    if (stat !== null) {
      if (stat.isFile()) {
        this.logger.info('File already exists', { filePath });
        this.logger.info(`File size local: ${stat.size} expected: ${expectedFileSize}`, { filePath });
        if (stat.size === expectedFileSize) {
          this.logger.info('File is same size. Skipping download', { filePath });
          closeWebSocketWithTruncateReason(webSocket, 1000, 'File already exists');
          return;
        } else {
          this.logger.info('File is not same size. Deleting file', { filePath });
          await fs.promises.unlink(filePath);
          this.logger.info('File deleted', { filePath });
        }
      } else {
        this.logger.error('File is not a file', { filePath });
        throw new Error('File is not a file');
      }
    }

    const { listenerss } = valueAccessor.get();
    const alreadyListeners = listenerss.get(filePath);
    if (alreadyListeners) {
      alreadyListeners.push(webSocket);
      this.logger.info('File is already downloading', { filePath });
      return;
    }
    this.logger.info('File is downloading', { filePath });
    listenerss.set(filePath, [webSocket]);
    const tempFileName = `${uuidv4()}.download`;
    const tempFilePath = path.resolve(HostPaths.tempPath, tempFileName);
    if (!fs.existsSync(HostPaths.tempPath)) {
      fs.mkdirSync(HostPaths.tempPath, { recursive: true });
    }
    const response = await axios.get(url, {
      responseType: 'stream',
      headers,
      timeout: DefaultHttpOptions.request.timeout,
    });
    if (!(response.data instanceof Stream)) {
      throw new Error('response.data is not stream');
    }
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);
    try {
      await stream.promises.finished(writer);
    } catch (error) {
      writer.close();
      throw error;
    }
    const dirPath = path.dirname(filePath);
    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.rename(tempFilePath, filePath);
    this.logger.info('File downloaded', { filePath });
    const allListeners = listenerss.get(filePath);
    if (!allListeners) {
      return;
    }
    listenerss.delete(filePath);
    const responseHeaders = Reflect.ownKeys(response.headers).reduce((acc, key) => {
      const value = Reflect.get(response.headers, key);
      if (Array.isArray(value)) {
        Reflect.set(acc, key, value.join(','));
      } else {
        Reflect.set(acc, key, String(value));
      }
      return acc;
    }, {} as Record<string, string>);
    const receiveMessage: Instance<typeof DeviceHostDownloadSharedResource.receiveMessage> = {
      responseCode: response.status,
      responseHeaders,
    };
    const receiveMessageSerialized = JSON.stringify(receiveMessage);
    for (const listener of allListeners) {
      listener.send(receiveMessageSerialized);
      closeWebSocketWithTruncateReason(listener, 1000, 'File downloaded');
    }
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
