import { DeviceId, OrganizationId, ProjectId, Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, DefaultHttpOptions, loop, stringify, transformAndValidate } from '@dogu-tech/common';
import { TcpRelayRequest, TcpRelayResponse } from '@dogu-tech/device-client-common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { Server } from 'ws';
import { WebSocketProxy } from '../../module/device-message/device-message.relayer';
import { WebsocketCloseError } from '../../module/device-message/error';
import { DoguLogger } from '../../module/logger/logger';
import { DeviceCommandService } from '../../module/organization/device/device-command.service';
import { RemoteWebDriverService } from '../../module/remote/remote-webdriver/remote-webdriver.service';
import { RemoteGamiumDto } from './remote-gamium.dto';
import { RemoteGamiumService } from './remote-gamium.service';

type ProxyType = WebSocketProxy<typeof TcpRelayRequest, typeof TcpRelayResponse>;
interface Context {
  dto: RemoteGamiumDto;
  proxy: ProxyType;
  organizationId: OrganizationId;
  projectId: ProjectId;
  deviceId: DeviceId;
  deviceSerial: Serial;
}

@WebSocketGateway({ path: '/ws/remote/gamium' })
export class RemoteGamiumGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly deviceCommandService: DeviceCommandService,
    private readonly remoteWebDriverService: RemoteWebDriverService,
    private readonly remoteGamiumService: RemoteGamiumService,
    private readonly logger: DoguLogger,
  ) {}

  afterInit(server: Server) {
    this.logger.info('Init');
    server.on('connection', (webSocket, request) => {});
  }

  async handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    this.logger.info('RemoteGamiumGateway.handleConnection');
    let context: Context | null = null;

    webSocket.addEventListener('error', (event) => {
      this.logger.verbose('error');
    });
    webSocket.addEventListener('close', (event) => {
      clearTimeout(timerId);
      const { code, reason } = event;
      this.logger.verbose('close', { code, reason });
      if (!context) {
        return;
      }
      context.proxy.close('clientside closed').catch((error) => {
        this.logger.error('close to deviceside error', { error: stringify(error) });
      });
    });
    webSocket.addEventListener('message', async (event: MessageEvent<ArrayBuffer>) => {
      this.logger.verbose('message');
      const { data } = event;
      const base64 = Buffer.from(data).toString('base64');
      if (!context) {
        for await (const _ of loop(1000, 10)) {
          if (context) {
            break;
          }
        }
        if (!context) {
          closeWebSocketWithTruncateReason(webSocket, 1001, 'proxy to device failed');
          return;
        }
      }
      this.remoteGamiumService
        .refreshCommandTimeout(this.remoteWebDriverService, context.organizationId, context.projectId, context.deviceId, context.deviceSerial, context.dto!.sessionId)
        .catch((error) => {
          this.logger.error('refreshCommandTimeout error', { error: stringify(error) });
        });

      await context.proxy
        .send({
          encodedData: base64,
        })
        .catch((error) => {
          this.logger.error('send to deviceside error', { error: stringify(error) });
          closeWebSocketWithTruncateReason(webSocket, 1001, error);
        });
    });

    // validate url query
    const url = new URL(`http:${incomingMessage.url ?? ''}`);
    const sessionIdQuery = url.searchParams.get('sessionId');
    const portQuery = url.searchParams.get('port') ?? '-';

    const remoteGamiumDto = await transformAndValidate(RemoteGamiumDto, {
      sessionId: sessionIdQuery,
      port: parseInt(portQuery),
    });

    const { sessionId, port } = remoteGamiumDto;
    const { device, remote } = await this.remoteGamiumService.findDeviceJob(sessionId, port);
    const timerId = setTimeout(() => {
      closeWebSocketWithTruncateReason(webSocket, 1000, 'Timeout');
    }, DefaultHttpOptions.request.timeout10minutes);

    const proxy = await this.deviceCommandService.relayTcp(device.organizationId, device.deviceId, device.serial, port);
    context = {
      dto: remoteGamiumDto,
      proxy,
      organizationId: device.organizationId,
      projectId: remote.projectId,
      deviceId: device.deviceId,
      deviceSerial: device.serial,
    };
    const pullDetach = async () => {
      if (!context) {
        return;
      }
      for await (const message of context.proxy.receive()) {
        webSocket.send(Buffer.from(message.encodedData, 'base64'));
      }
      closeWebSocketWithTruncateReason(webSocket, 1001, 'socket closed from deviceside');
    };
    pullDetach().catch((error) => {
      if (error instanceof WebsocketCloseError) {
        this.logger.info('socket closed from deviceside', { code: error.code, reason: error.reason });
        closeWebSocketWithTruncateReason(webSocket, error.code, error.reason);
        return;
      }
      if (webSocket.readyState !== WebSocket.OPEN) {
        return;
      }
      this.logger.error('socket error from deviceside ', { error: stringify(error) });
      closeWebSocketWithTruncateReason(webSocket, 1001, error);
    });
  }

  handleDisconnect(webSocket: WebSocket): void {
    this.logger.info('RemoteGamiumGateway.handleDisconnect');
  }
}