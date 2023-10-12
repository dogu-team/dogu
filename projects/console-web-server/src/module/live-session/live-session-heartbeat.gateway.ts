import { LiveSessionState } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import WebSocket from 'ws';
import { LiveSession } from '../../db/entity/live-session.entity';
import { DoguLogger } from '../logger/logger';
import { LiveSessionService } from './live-session.service';

@WebSocketGateway({ path: '/live-session-heartbeat' })
export class LiveSessionHeartbeatGateway implements OnGatewayConnection {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly liveSessionService: LiveSessionService,
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
      (async () => {
        await this.liveSessionService.updateHeartbeat(liveSessionId);
      })().catch((error) => {
        this.logger.error('LiveSessionHeartbeatGateway.onMessage.catch', { error: errorify(error) });
      });
    });

    webSocket.on('close', () => {
      (async () => {
        const count = await this.liveSessionService.decreaseParticipantsCount(liveSessionId);
        if (count < 1) {
          await this.dataSource.transaction(async (manager) => {
            const liveSession = await manager.getRepository(LiveSession).findOne({ where: { liveSessionId } });
            if (!liveSession) {
              return;
            }

            if (liveSession.organizationId !== organizationId) {
              return;
            }

            if (liveSession.state === LiveSessionState.CREATED) {
              liveSession.state = LiveSessionState.CLOSE_WAIT;
              await manager.getRepository(LiveSession).save(liveSession);
              this.logger.debug('LiveSessionHeartbeatGateway.onClose.toCloseWait', { liveSession });
            }
          });
        }
      })().catch((error) => {
        this.logger.error('LiveSessionHeartbeatGateway.onClose.catch', { error: errorify(error) });
      });
    });

    await this.dataSource.transaction(async (manager) => {
      const liveSession = await manager.getRepository(LiveSession).findOne({ where: { liveSessionId } });
      if (!liveSession) {
        webSocket.close(1003, `not found`);
        return;
      }

      if (liveSession.organizationId !== organizationId) {
        webSocket.close(1003, `invalid organization`);
        return;
      }

      if (liveSession.state === LiveSessionState.CLOSED) {
        webSocket.close(1003, `already closed`);
        return;
      }

      if (liveSession.state === LiveSessionState.CLOSE_WAIT) {
        liveSession.state = LiveSessionState.CREATED;
        await manager.getRepository(LiveSession).save(liveSession);
        this.logger.debug('LiveSessionHeartbeatGateway.handleConnection.toCreated', { liveSession });
      }

      const unsubscribe = await this.liveSessionService.subscribeCloseEvent(liveSessionId, (message) => {
        webSocket.close(1003, 'closed');
        this.logger.debug('LiveSessionHeartbeatGateway.onClose.subscribeCloseEvent', { liveSessionId, message });
      });
      webSocket.on('close', () => {
        (async () => {
          await unsubscribe();
        })().catch((error) => {
          this.logger.error('LiveSessionHeartbeatGateway.onClose.unsubscribe.catch', { error: errorify(error) });
        });
      });
      await this.liveSessionService.updateHeartbeat(liveSessionId);
      await this.liveSessionService.increaseParticipantsCount(liveSessionId);
    });
  }
}
