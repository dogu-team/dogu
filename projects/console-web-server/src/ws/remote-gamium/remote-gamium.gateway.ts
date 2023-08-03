import { closeWebSocketWithTruncateReason, DefaultHttpOptions, loop, stringify, transformAndValidate } from '@dogu-tech/common';
import { TcpRelayRequest, TcpRelayResponse } from '@dogu-tech/device-client-common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { Server } from 'ws';
import { WebSocketProxy } from '../../module/device-message/device-message.relayer';
import { DoguLogger } from '../../module/logger/logger';
import { DeviceCommandService } from '../../module/organization/device/device-command.service';
import { RemoteGamiumDto } from './remote-gamium.dto';
import { RemoteGamiumService } from './remote-gamium.service';

type ProxyType = WebSocketProxy<typeof TcpRelayRequest, typeof TcpRelayResponse>;
interface Context {
  dto: RemoteGamiumDto | undefined;
  proxy: ProxyType | undefined;
}

@WebSocketGateway({ path: '/ws/remote/gamium' })
export class RemoteGamiumGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly deviceCommandService: DeviceCommandService, private readonly remoteGamiumService: RemoteGamiumService, private readonly logger: DoguLogger) {}

  afterInit(server: Server) {
    this.logger.info('Init');
    server.on('connection', (webSocket, request) => {});
  }

  async handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    this.logger.info('RemoteGamiumGateway.handleConnection');
    const context: Context = { dto: undefined, proxy: undefined };

    webSocket.addEventListener('error', (event) => {
      this.logger.verbose('error');
    });
    webSocket.addEventListener('close', (event) => {
      clearTimeout(timerId);
      const { code, reason } = event;
      this.logger.verbose('close', { code, reason });
      if (!context.proxy) {
        return;
      }
      context.proxy.close().catch((error) => {
        this.logger.error('close to deviceside error', { error: stringify(error) });
      });
    });
    webSocket.addEventListener('message', async (event: MessageEvent<ArrayBuffer>) => {
      this.logger.verbose('message');
      const { data } = event;
      const base64 = Buffer.from(data).toString('base64');
      if (!context.proxy) {
        for await (const _ of loop(1000, 10)) {
          if (context.proxy) {
            break;
          }
        }
        if (!context.proxy) {
          closeWebSocketWithTruncateReason(webSocket, 1001, 'proxy to device failed');
          return;
        }
      }

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
    context.dto = remoteGamiumDto;

    const { sessionId, port } = remoteGamiumDto;
    const device = await this.remoteGamiumService.findDeviceJob(sessionId, port);
    const timerId = setTimeout(() => {
      closeWebSocketWithTruncateReason(webSocket, 1000, 'Timeout');
    }, DefaultHttpOptions.request.timeout10minutes);

    context.proxy = await this.deviceCommandService.relayTcp(device.organizationId, device.deviceId, device.serial, port);
    const pullDetach = async () => {
      if (!context.proxy) {
        return;
      }
      for await (const message of context.proxy.receive()) {
        webSocket.send(Buffer.from(message.encodedData, 'base64'));
      }
    };
    pullDetach().catch((error) => {
      if (webSocket.readyState !== WebSocket.OPEN) {
        return;
      }
      this.logger.error('socket closed from deviceside ', { error: stringify(error) });
      closeWebSocketWithTruncateReason(webSocket, 1001, error);
    });
  }

  handleDisconnect(webSocket: WebSocket): void {
    this.logger.info('RemoteGamiumGateway.handleDisconnect');
  }
}
