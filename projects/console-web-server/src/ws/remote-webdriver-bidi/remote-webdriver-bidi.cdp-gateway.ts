import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';

@WebSocketGateway({ path: '/session' })
export class RemoteWebDriverBiDiCdpGateway implements OnGatewayConnection {
  async handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    console.log('RemoteWebDriverBiDiCdpGateway.handleConnection');
    await Promise.resolve();
  }
}
