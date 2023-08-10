import { WebSocketProxyReceiveClose } from '@dogu-private/console-host-agent';
import { DEVICE_TABLE_NAME } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, errorify, HeaderRecord } from '@dogu-tech/common';
import { DeviceHostWebSocketRelay, DoguDeviceHostWebSocketRelayUrlHeader, WebSocketRelayRequest, WebSocketRelayResponse } from '@dogu-tech/device-client-common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import { RemoteDeviceJob } from '../../db/entity/remote-device-job.entity';
import { DeviceMessageRelayer, WebSocketProxy } from '../../module/device-message/device-message.relayer';
import { DoguLogger } from '../../module/logger/logger';
import { PatternBasedWebSocketGateway, PatternBasedWebSocketInfo } from '../common/pattern-based-ws-adaptor';

type WebSocketProxyType = WebSocketProxy<typeof WebSocketRelayRequest, typeof WebSocketRelayResponse>;

@PatternBasedWebSocketGateway('/session/:sessionId/se/cdp')
export class RemoteWebDriverBiDiCdpGateway implements OnGatewayConnection {
  private proxies = new Map<string, WebSocketProxyType>();

  constructor(
    private readonly logger: DoguLogger,
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage, info: PatternBasedWebSocketInfo): Promise<void> {
    try {
      await this.handleConnectionInternal(webSocket, incomingMessage, info);
    } catch (error) {
      const errorified = errorify(error);
      this.closeWebSocket(webSocket, 1011, errorified.message, { error: errorified });
    }
  }

  private closeWebSocket(webSocket: WebSocket, code: number, reason: string, details?: Record<string, unknown>): void {
    closeWebSocketWithTruncateReason(webSocket, code, reason);
    this.logger.info('closed websocket', { code, reason, details });
  }

  private async handleConnectionInternal(webSocket: WebSocket, incomingMessage: IncomingMessage, info: PatternBasedWebSocketInfo): Promise<void> {
    const sessionId = info.params.get('sessionId');
    if (!sessionId) {
      this.closeWebSocket(webSocket, 1008, 'sessionId is required', { info });
      return;
    }

    const remoteDeviceJob = await this.dataSource.getRepository(RemoteDeviceJob).findOne({ where: { sessionId }, relations: [DEVICE_TABLE_NAME] });
    if (!remoteDeviceJob) {
      this.closeWebSocket(webSocket, 1008, 'remoteDeviceJob not found', { sessionId });
      return;
    }

    const { device, deviceId, seCdp } = remoteDeviceJob;
    if (!device) {
      this.closeWebSocket(webSocket, 1011, 'device not found', { remoteDeviceJob });
      return;
    }

    if (!seCdp) {
      this.closeWebSocket(webSocket, 1011, 'seCdp not found', { remoteDeviceJob });
      return;
    }

    const { organizationId } = device;
    const headers: HeaderRecord = {
      [DoguDeviceHostWebSocketRelayUrlHeader]: seCdp,
    };
    const proxy = await this.deviceMessageRelayer.connectWebSocket(organizationId, deviceId, DeviceHostWebSocketRelay, headers);
    this.proxies.set(sessionId, proxy);

    webSocket.addEventListener('close', () => {
      this.proxies.delete(sessionId);
      proxy.close('client closed');
    });
    webSocket.addEventListener('message', (event) => {
      this.logger.verbose('received message from client', { data: event.data });
      proxy.send({
        data: event.data,
      });
    });

    (async () => {
      for await (const message of proxy.receive()) {
        if (message instanceof WebSocketProxyReceiveClose) {
          this.closeWebSocket(webSocket, message.code, message.reason);
        } else {
          webSocket.send(message.data);
        }
      }
    })().catch((error) => {
      this.logger.error('error in websocket relayer', { error });
    });
  }
}
