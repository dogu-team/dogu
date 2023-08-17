import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { Logger } from '../../logger.js';

interface WebSocketInfo {
  incomingMessage: IncomingMessage;
}

@WebSocketGateway({ path: '/pytest', transports: ['websocket'] })
export class PytestGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = Logger.create(PytestGateway);
  private readonly webSocketInfos = new Map<WebSocket, WebSocketInfo>();

  handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage) {
    this.webSocketInfos.set(webSocket, { incomingMessage });
    this.logger.debug('handleConnection', incomingMessage.url);
  }

  handleDisconnect(webSocket: WebSocket) {
    const webSocketInfo = this.webSocketInfos.get(webSocket);
    this.webSocketInfos.delete(webSocket);
    if (webSocketInfo) {
      const { incomingMessage } = webSocketInfo;
      const { url } = incomingMessage;
      this.logger.debug('handleDisconnect', url);
    }
  }

  @SubscribeMessage('aaa')
  handleEvent(webSocket: WebSocket, data: string): string {
    return data;
  }
}
