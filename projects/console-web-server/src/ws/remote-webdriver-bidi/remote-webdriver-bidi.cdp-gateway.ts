import { OnGatewayConnection } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DeviceMessageRelayer } from '../../module/device-message/device-message.relayer';
import { DoguLogger } from '../../module/logger/logger';
import { PatternRoutableWebSocketGateway } from '../common/pattern-routable-ws-adaptor';

@PatternRoutableWebSocketGateway('/session/:sessionId/se/cdp')
export class RemoteWebDriverBiDiCdpGateway implements OnGatewayConnection {
  static readonly PathPattern = /^\/session\/([^/]+)\/se\/cdp$/;

  constructor(private readonly logger: DoguLogger, private readonly deviceMessageRelayer: DeviceMessageRelayer) {}

  async handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    const { url } = incomingMessage;
    if (!url) {
      throw new Error('url is required');
    }

    const match = url.match(RemoteWebDriverBiDiCdpGateway.PathPattern);
    if (!match) {
      throw new Error('url is not matched');
    }

    const [, sessionId] = match as (string | undefined)[];
    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    // find original base url by sessionId
    /**
     * FIXME: this is just a mock
     */
    const baseUrl = 'ws://localhost:4444';
    const organizationId = 'org1';
    const deviceId = 'device1';
    this.deviceMessageRelayer.connectWebSocket(organizationId, deviceId);
  }
}
