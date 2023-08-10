import { WebSocketProxyReceiveClose } from '@dogu-private/console-host-agent';
import { DEVICE_TABLE_NAME } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, errorify, HeaderRecord } from '@dogu-tech/common';
import { DeviceHostWebSocketRelay, DoguDeviceHostWebSocketRelayUrlHeader } from '@dogu-tech/device-client-common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import { RemoteDeviceJob } from '../../db/entity/remote-device-job.entity';
import { DeviceMessageRelayer, WebSocketProxy } from '../../module/device-message/device-message.relayer';
import { DoguLogger } from '../../module/logger/logger';
import { PatternBasedWebSocketGateway, PatternBasedWebSocketInfo } from '../common/pattern-based-ws-adaptor';

type WebSocketProxyType = WebSocketProxy<typeof DeviceHostWebSocketRelay.sendMessage, typeof DeviceHostWebSocketRelay.receiveMessage>;

interface ToWebSocketInfo {
  toWebSocket: WebSocketProxyType | null;
  messageBuffer: string[];
}

@PatternBasedWebSocketGateway('/session/:sessionId/se/cdp')
export class RemoteWebDriverBiDiCdpGateway implements OnGatewayConnection {
  private toWebSocketInfos = new Map<string, ToWebSocketInfo>();

  constructor(
    private readonly logger: DoguLogger,
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async handleConnection(fromWebSocket: WebSocket, incomingMessage: IncomingMessage, info: PatternBasedWebSocketInfo): Promise<void> {
    try {
      const sessionId = this.handleConnectionSyncPart(fromWebSocket, incomingMessage, info);
      if (!sessionId) {
        throw new Error('sessionId is required');
      }

      await this.handleConnectionAsyncPart(fromWebSocket, incomingMessage, info, sessionId);
    } catch (error) {
      const errorified = errorify(error);
      this.closeWebSocket(fromWebSocket, 1011, errorified.message, { error: errorified });
    }
  }

  private closeWebSocket(fromWebSocket: WebSocket, code: number, reason: string, details?: Record<string, unknown>): void {
    closeWebSocketWithTruncateReason(fromWebSocket, code, reason);
    this.logger.info('closed websocket', { code, reason, details });
  }

  private async handleConnectionAsyncPart(fromWebSocket: WebSocket, incomingMessage: IncomingMessage, info: PatternBasedWebSocketInfo, sessionId: string): Promise<void> {
    const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { sessionId }, relations: [DEVICE_TABLE_NAME] });
    if (!remoteDeviceJob) {
      this.closeWebSocket(fromWebSocket, 1008, 'remoteDeviceJob not found', { sessionId });
      return;
    }

    const { device, deviceId, seCdp } = remoteDeviceJob;
    if (!device) {
      this.closeWebSocket(fromWebSocket, 1011, 'device not found', { remoteDeviceJob });
      return;
    }

    if (!seCdp) {
      this.closeWebSocket(fromWebSocket, 1011, 'seCdp not found', { remoteDeviceJob });
      return;
    }

    const { organizationId } = device;
    const headers: HeaderRecord = {
      [DoguDeviceHostWebSocketRelayUrlHeader]: seCdp,
    };
    const toWebSocket = await this.deviceMessageRelayer.connectWebSocket(organizationId, deviceId, DeviceHostWebSocketRelay, headers);

    const registeredToWebSocketInfo = this.toWebSocketInfos.get(sessionId);
    if (!registeredToWebSocketInfo) {
      this.closeWebSocket(fromWebSocket, 1011, 'toWebSocketInfo not found', { sessionId });
      return;
    }

    for (const message of registeredToWebSocketInfo.messageBuffer) {
      toWebSocket
        .send({
          data: message,
        })
        .catch((error) => {
          this.logger.error('error in sending message to toWebSocket', { error: errorify(error) });
        });
    }
    registeredToWebSocketInfo.messageBuffer = [];
    registeredToWebSocketInfo.toWebSocket = toWebSocket;

    (async (): Promise<void> => {
      for await (const message of toWebSocket.receive()) {
        if (message instanceof WebSocketProxyReceiveClose) {
          this.closeWebSocket(fromWebSocket, message.code, message.reason);
        } else {
          const data = message.data;
          fromWebSocket.send(data);
        }
      }
    })().catch((error) => {
      this.logger.error('error in websocket relayer', { error: errorify(error) });
    });

    this.logger.verbose('connected', { sessionId });
  }

  private handleConnectionSyncPart(fromWebSocket: WebSocket, incomingMessage: IncomingMessage, info: PatternBasedWebSocketInfo): string | null {
    const sessionId = info.params.get('sessionId');
    if (!sessionId) {
      this.closeWebSocket(fromWebSocket, 1008, 'sessionId is required', { info });
      return null;
    }

    if (this.toWebSocketInfos.has(sessionId)) {
      this.closeWebSocket(fromWebSocket, 1008, 'already connected', { sessionId });
      return null;
    }

    const toWebSocketInfo: ToWebSocketInfo = {
      toWebSocket: null,
      messageBuffer: [],
    };
    this.toWebSocketInfos.set(sessionId, toWebSocketInfo);

    fromWebSocket.addEventListener('close', (ev) => {
      const toWebSocketInfo = this.toWebSocketInfos.get(sessionId);
      if (toWebSocketInfo?.toWebSocket) {
        toWebSocketInfo.toWebSocket.close('client closed').catch((error) => {
          this.logger.error('error in closing toWebSocket', { error: errorify(error) });
        });
      }
      this.toWebSocketInfos.delete(sessionId);
      this.logger.verbose('closed fromWebSocket', { code: ev.code, reason: ev.reason });
    });

    fromWebSocket.addEventListener('error', (ev) => {
      this.logger.verbose('error in fromWebSocket', { event: ev });
    });

    fromWebSocket.addEventListener('message', (ev) => {
      const stringified = typeof ev.data === 'string' ? ev.data : String(ev.data);
      if (toWebSocketInfo.toWebSocket) {
        toWebSocketInfo.toWebSocket
          .send({
            data: stringified,
          })
          .catch((error) => {
            this.logger.error('error in sending message to toWebSocket', { error: errorify(error) });
          });
      } else {
        toWebSocketInfo.messageBuffer.push(stringified);
      }

      this.logger.verbose('received message from fromWebSocket', { data: stringified });
    });

    return sessionId;
  }
}
