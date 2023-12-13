import { CloudLicenseEventMessage, CloudLicenseLiveTestingEvent } from '@dogu-private/console';
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
import { Message, RetryTransaction } from '../../db/utils';
import { CloudLicenseEventSubscriber } from '../../enterprise/module/license/cloud-license.event-subscriber';
import { WsCommonService } from '../../ws/common/ws-common.service';
import { DoguLogger } from '../logger/logger';
import { LiveSessionService } from './live-session.service';
import { LiveSessionSubscriber } from './live-session.subscriber';

@WebSocketGateway({ path: '/live-session-heartbeat' })
export class LiveSessionHeartbeatGateway implements OnGatewayConnection {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @Inject(WsCommonService)
    private readonly wsCommonService: WsCommonService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly liveSessionService: LiveSessionService,
    private readonly liveSessionSubscriber: LiveSessionSubscriber,
    private readonly cloudLicenseEventSubscriber: CloudLicenseEventSubscriber,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

  async handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    const url = new URL(`http://localhost${incomingMessage.url ?? ''}`);
    const organizationId = url.searchParams.get('organizationId');
    const liveSessionId = url.searchParams.get('liveSessionId');

    if (!organizationId) {
      this.logger.error(`LiveSessionHeartbeatGateway.handleConnection organizationId is required`);
      webSocket.close(1003, `organizationId is required`);
      return;
    }

    if (!liveSessionId) {
      this.logger.error(`LiveSessionHeartbeatGateway.handleConnection liveSessionId is required`);
      webSocket.close(1003, `liveSessionId is required`);
      return;
    }

    this.wsCommonService.sendPing(webSocket, 'LiveSessionHeartbeatGateway');

    const validateResult = await this.wsCommonService.validateCloudDeviceAccessPermission(incomingMessage, this.dataSource, organizationId, liveSessionId);
    if (!validateResult.result) {
      this.logger.info(`LiveSessionHeartbeatGateway.handleConnection ${validateResult.message}`);
      closeWebSocketWithTruncateReason(webSocket, 1003, 'Unauthorized');
    }

    webSocket.on('message', () => {
      this.liveSessionService.updateHeartbeat(liveSessionId).catch((e) => {
        this.logger.error('LiveSessionHeartbeatGateway.onMessage.catch', { error: errorify(e) });
      });
    });

    webSocket.on('close', () => {
      (async (): Promise<void> => {
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

    {
      const handler = (message: Message<LiveSession>): void => {
        if (message.data.liveSessionId !== liveSessionId) {
          return;
        }

        if (message.data.state === LiveSessionState.CLOSE_WAIT) {
          const msg: LiveSessionWsMessage = {
            type: LiveSessionState.CLOSE_WAIT,
            message: `${config.liveSession.closeWait.allowedMilliseconds}`,
          };
          webSocket.send(JSON.stringify(msg));
          this.logger.debug('LiveSessionHeartbeatGateway.handleConnection.liveSessionSubscriber.handler', { liveSessionId, message });
          return;
        }

        if (message.data.state === LiveSessionState.CLOSED) {
          webSocket.close(1003, 'closed');
          this.logger.debug('LiveSessionHeartbeatGateway.handleConnection.liveSessionSubscriber.handler', { liveSessionId, message });
          return;
        }
      };
      webSocket.on('close', () => {
        this.liveSessionSubscriber.emitter.off('message', handler);
      });
      this.liveSessionSubscriber.emitter.on('message', handler);
    }

    {
      const handler = (message: CloudLicenseEventMessage): void => {
        if (message.organizationId !== organizationId) {
          return;
        }

        const value: CloudLicenseLiveTestingEvent = {
          remainingFreeSeconds: message.liveTestingRemainingFreeSeconds,
        };
        const msg: LiveSessionWsMessage = {
          type: 'cloud-license-live-testing',
          message: JSON.stringify(value),
        };
        webSocket.send(JSON.stringify(msg));
      };
      webSocket.on('close', () => {
        this.cloudLicenseEventSubscriber.emitter.off('message', handler);
      });
      this.cloudLicenseEventSubscriber.emitter.on('message', handler);
    }

    await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      const liveSession = await manager.getRepository(LiveSession).findOne({ where: { liveSessionId } });
      if (!liveSession) {
        this.logger.error(`LiveSessionHeartbeatGateway.handleConnection liveSession not found`, { liveSessionId });
        webSocket.close(1003, `not found`);
        return;
      }

      if (liveSession.organizationId !== organizationId) {
        this.logger.error(`LiveSessionHeartbeatGateway.handleConnection invalid organization`, { liveSessionId, organizationId });
        webSocket.close(1003, `invalid organization`);
        return;
      }

      if (liveSession.state === LiveSessionState.CLOSED) {
        this.logger.error(`LiveSessionHeartbeatGateway.handleConnection already closed`, { liveSessionId });
        webSocket.close(1003, `already closed`);
        return;
      }

      if (liveSession.state === LiveSessionState.CLOSE_WAIT) {
        liveSession.state = LiveSessionState.CREATED;
        await manager.save(liveSession);
        this.logger.debug('LiveSessionHeartbeatGateway.handleConnection.toCreated', { liveSession });
      }
    });
    await this.liveSessionService.updateHeartbeat(liveSessionId);
    await this.liveSessionService.increaseParticipantsCount(liveSessionId);
  }
}
