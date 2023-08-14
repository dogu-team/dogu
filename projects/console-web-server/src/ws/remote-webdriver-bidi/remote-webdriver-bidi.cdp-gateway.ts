import { WebSocketProxyReceiveClose } from '@dogu-private/console-host-agent';
import { DEVICE_TABLE_NAME } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, errorify, HeaderRecord, PrefixLogger } from '@dogu-tech/common';
import { DeviceWebSocketRelay, DoguDeviceWebSocketRelaySerialHeader, DoguDeviceWebSocketRelayUrlHeader } from '@dogu-tech/device-client-common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import { RemoteDeviceJob } from '../../db/entity/remote-device-job.entity';
import { DeviceMessageRelayer, WebSocketProxy } from '../../module/device-message/device-message.relayer';
import { logger } from '../../module/logger/logger.instance';
import { PatternBasedWebSocketGateway, PatternBasedWebSocketInfo } from '../common/pattern-based-ws-adaptor';

type ToWebSocket = WebSocketProxy<typeof DeviceWebSocketRelay.sendMessage, typeof DeviceWebSocketRelay.receiveMessage>;

interface ToWebSocketInfo {
  toWebSocket: ToWebSocket | null;
  messageBuffer: string[];
}

@PatternBasedWebSocketGateway('/session/:sessionId/se/cdp')
export class RemoteWebDriverBiDiCdpGateway implements OnGatewayConnection {
  private readonly logger = new PrefixLogger(logger, RemoteWebDriverBiDiCdpGateway.name);
  private toWebSocketInfos = new Map<string, ToWebSocketInfo>();

  constructor(
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async handleConnection(fromWebSocket: WebSocket, incomingMessage: IncomingMessage, patternBasedWebSocketInfo: PatternBasedWebSocketInfo): Promise<void> {
    try {
      const sessionId = this.parseSessionId(fromWebSocket, patternBasedWebSocketInfo);
      if (!sessionId) {
        throw new Error('Internal error: sessionId is required');
      }

      this.setHandlers(fromWebSocket, sessionId);

      const toWebSocket = await this.createToWebSocket(fromWebSocket, sessionId);
      if (!toWebSocket) {
        throw new Error('Internal error: toWebSocket is required');
      }

      this.relayMessage(fromWebSocket, toWebSocket);
      this.flushMessageBuffer(fromWebSocket, sessionId, toWebSocket);
    } catch (error) {
      const errorified = errorify(error);
      this.closeWebSocket(fromWebSocket, 1011, errorified.message, { error: errorified });
    }
  }

  private closeWebSocket(fromWebSocket: WebSocket, code: number, reason: string, details?: Record<string, unknown>): void {
    closeWebSocketWithTruncateReason(fromWebSocket, code, reason);
    this.logger.info('closed websocket', { code, reason, details });
  }

  private flushMessageBuffer(fromWebSocket: WebSocket, sessionId: string, toWebSocket: ToWebSocket): void {
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
  }

  private async createToWebSocket(fromWebSocket: WebSocket, sessionId: string): Promise<ToWebSocket | null> {
    const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { sessionId }, relations: [DEVICE_TABLE_NAME] });
    if (!remoteDeviceJob) {
      this.closeWebSocket(fromWebSocket, 1008, 'remoteDeviceJob not found', { sessionId });
      return null;
    }

    const { device, deviceId, webDriverSeCdp } = remoteDeviceJob;
    if (!device) {
      this.closeWebSocket(fromWebSocket, 1011, 'device not found', { remoteDeviceJob });
      return null;
    }

    if (!webDriverSeCdp) {
      this.closeWebSocket(fromWebSocket, 1011, 'seCdp not found', { remoteDeviceJob });
      return null;
    }

    const { organizationId, serial } = device;
    const headers: HeaderRecord = {
      [DoguDeviceWebSocketRelaySerialHeader]: serial,
      [DoguDeviceWebSocketRelayUrlHeader]: webDriverSeCdp,
    };
    const toWebSocket = await this.deviceMessageRelayer.connectWebSocket(organizationId, deviceId, DeviceWebSocketRelay, headers);

    this.logger.verbose('connected', { sessionId });
    return toWebSocket;
  }

  private relayMessage(fromWebSocket: WebSocket, toWebSocket: ToWebSocket): void {
    (async (): Promise<void> => {
      for await (const message of toWebSocket.receive()) {
        if (message instanceof WebSocketProxyReceiveClose) {
          this.closeWebSocket(fromWebSocket, message.code, message.reason);
        } else {
          fromWebSocket.send(message.data);
        }
      }
    })().catch((error) => {
      this.logger.error('error in websocket relayer', { error: errorify(error) });
    });
  }

  private parseSessionId(fromWebSocket: WebSocket, patternBasedWebSocketInfo: PatternBasedWebSocketInfo): string | null {
    const sessionId = patternBasedWebSocketInfo.params.get('sessionId');
    if (!sessionId) {
      this.closeWebSocket(fromWebSocket, 1008, 'sessionId is required', { patternBasedWebSocketInfo });
      return null;
    }

    if (this.toWebSocketInfos.has(sessionId)) {
      this.closeWebSocket(fromWebSocket, 1008, 'already connected', { sessionId });
      return null;
    }

    return sessionId;
  }

  private setHandlers(fromWebSocket: WebSocket, sessionId: string): void {
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
  }
}
