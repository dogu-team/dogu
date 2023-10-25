import { closeWebSocketWithTruncateReason } from '@dogu-tech/common';
import { WebSocketClientCreateOptions as OptionsBase, WebSocketClientFactory } from '@dogu-tech/node';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { WebSocket } from 'ws';
import { DoguLogger } from '../logger/logger';

export interface WebSocketClientCreateOptions extends OptionsBase {
  id: string;
}

@Injectable()
export class WebSocketClientRegistryService implements OnModuleDestroy {
  private readonly webSockets = new Map<string, WebSocket>();
  private readonly factory = new WebSocketClientFactory();

  constructor(private readonly logger: DoguLogger) {}

  onModuleDestroy() {
    this.webSockets.forEach((webSocket) => closeWebSocketWithTruncateReason(webSocket, 1001, 'server shutdown'));
  }

  create(id: string, url: string): WebSocket {
    if (this.webSockets.has(id)) {
      throw new Error(`websocket client already exists. id: ${id}`);
    }

    const webSocket = this.factory.create({ url });
    webSocket.on('close', (code, reason) => {
      this.webSockets.delete(id);
      this.logger.debug(`websocket client closed`, { id, code, reason: reason.toString() });
    });
    this.webSockets.set(id, webSocket);

    webSocket.on('error', (error) => {
      this.logger.error(`websocket client error`, { id, error });
    });
    return webSocket;
  }

  get(id: string): WebSocket | undefined {
    return this.webSockets.get(id);
  }

  close(id: string, code?: number, reason?: unknown): void {
    const webSocket = this.webSockets.get(id);
    if (!webSocket) {
      this.logger.warn(`websocket client does not exist. id: ${id}`);
      return;
    }

    closeWebSocketWithTruncateReason(webSocket, code, reason);
  }
}
