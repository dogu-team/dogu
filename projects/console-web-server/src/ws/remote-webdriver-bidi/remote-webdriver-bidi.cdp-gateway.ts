import { OnGatewayConnection } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { PatternRoutableWebSocketGateway } from '../common/pattern-routable-ws-adaptor';

@PatternRoutableWebSocketGateway('/session/:sessionId/se/cdp')
export class RemoteWebDriverBiDiCdpGateway implements OnGatewayConnection {
  async handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    console.log('RemoteWebDriverBiDiCdpGateway.handleConnection');
    await Promise.resolve();
  }
}
