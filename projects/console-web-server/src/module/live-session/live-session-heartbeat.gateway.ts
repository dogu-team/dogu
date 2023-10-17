import { LiveSessionState, LiveSessionWsMessage } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, errorify } from '@dogu-tech/common';
import { Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import WebSocket from 'ws';
import { config } from '../../config';

import { LiveSession } from '../../db/entity/live-session.entity';
import { WsCommonService } from '../../ws/common/ws-common.service';
import { DoguLogger } from '../logger/logger';
import { LiveSessionService } from './live-session.service';

@WebSocketGateway({ path: '/live-session-heartbeat' })
export class LiveSessionHeartbeatGateway implements OnGatewayConnection {
  constructor(
    private readonly logger: DoguLogger,
    @Inject(WsCommonService)
    private readonly wsCommonService: WsCommonService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly liveSessionService: LiveSessionService,
  ) {}

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

    const validateResult = await this.wsCommonService.validateCloudDeviceAccessPermission(incomingMessage, this.dataSource, organizationId, liveSessionId);
    if (!validateResult.result) {
      this.logger.info(`LiveSessionHeartbeatGateway. handleConnection. ${validateResult.message}`);
      closeWebSocketWithTruncateReason(webSocket, 1003, 'Unauthorized');
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
          const rv = await this.dataSource
            .getRepository(LiveSession)
            .update({ liveSessionId, state: LiveSessionState.CREATED, organizationId }, { state: LiveSessionState.CLOSE_WAIT, closeWaitAt: new Date() });
          this.logger.debug('LiveSessionHeartbeatGateway.onClose.toCloseWait', { rv });
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

      const unsubscribeCloseWaitEvent = await this.liveSessionService.subscribeCloseWaitEvent(liveSessionId, (message) => {
        const msg: LiveSessionWsMessage = {
          type: LiveSessionState.CLOSE_WAIT,
          message: `${config.liveSession.closeWait.allowedMilliseconds}`,
        };
        webSocket.send(JSON.stringify(msg));
        this.logger.debug('LiveSessionHeartbeatGateway.onClose.subscribeCloseWaitEvent', { liveSessionId, message });
      });

      const unsubscribeCloseEvent = await this.liveSessionService.subscribeCloseEvent(liveSessionId, (message) => {
        webSocket.close(1003, 'closed');
        this.logger.debug('LiveSessionHeartbeatGateway.onClose.subscribeCloseEvent', { liveSessionId, message });
      });

      webSocket.on('close', () => {
        (async () => {
          await unsubscribeCloseEvent();
          await unsubscribeCloseWaitEvent();
        })().catch((error) => {
          this.logger.error('LiveSessionHeartbeatGateway.onClose.unsubscribe.catch', { error: errorify(error) });
        });
      });
      await this.liveSessionService.updateHeartbeat(liveSessionId);
      await this.liveSessionService.increaseParticipantsCount(liveSessionId);
    });
  }
}
