import { LiveSessionId } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import WebSocket from 'ws';
import { LiveSession } from '../../db/entity/live-session.entity';
import { DoguLogger } from '../logger/logger';

@WebSocketGateway({ path: '/live-session-heartbeat' })
export class LiveSessionHeartbeatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * @fixme - henry: validation
   */
  async handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    const url = new URL(`http://localhost${incomingMessage.url ?? ''}`);
    const organizationId = url.searchParams.get('organizationId');
    const liveSessionId = url.searchParams.get('liveSessionId');

    if (!organizationId) {
      webSocket.close(1003, `organizationId is required`);
      return;
    }

    if (!liveSessionId) {
      webSocket.close(1003, `liveSessionId is required`);
      return;
    }

    webSocket.on('message', () => {
      this.updateHeartbeat(liveSessionId);
    });

    const liveSession = await this.dataSource.manager.getRepository(LiveSession).findOne({ where: { liveSessionId } });
    if (!liveSession) {
      webSocket.close(1003, `liveSession not found`);
      return;
    }

    if (liveSession.organizationId !== organizationId) {
      webSocket.close(1003, `organizationId not matched`);
      return;
    }
  }

  async handleDisconnect(webSocket: WebSocket): Promise<void> {}

  private updateHeartbeat(liveSessionId: LiveSessionId): void {
    (async () => {
      try {
        await this.dataSource.getRepository(LiveSession).update({ liveSessionId }, { heartbeat: () => 'NOW()' });
      } catch (error) {
        this.logger.error('LiveSessionHeartbeatGateway.onMessage', { error: errorify(error) });
      }
    })().catch((error) => {
      this.logger.error('LiveSessionHeartbeatGateway.onMessage.catch', { error: errorify(error) });
    });
  }
}
