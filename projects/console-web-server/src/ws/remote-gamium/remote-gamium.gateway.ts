import { WebSocketProxyReceiveClose } from '@dogu-private/console-host-agent';
import { DeviceId, OrganizationId, ProjectId, Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, DefaultHttpOptions, loop, stringify, transformAndValidate } from '@dogu-tech/common';
import { TcpRelayRequest, TcpRelayResponse } from '@dogu-tech/device-client-common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocketProxy } from '../../module/device-message/device-message.relayer';
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
  lastWdSendTime: number;
}

@WebSocketGateway({ path: '/ws/remote/gamium' })
export class RemoteGamiumGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly deviceCommandService: DeviceCommandService,
    private readonly remoteWebDriverService: RemoteWebDriverService,
    private readonly remoteGamiumService: RemoteGamiumService,
    private readonly logger: DoguLogger,
  ) {}

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
    this.addSendListener(webSocket, () => context);

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
      lastWdSendTime: 0,
    };
    this.pullDetach(context, webSocket).catch((error) => {
      if (webSocket.readyState !== WebSocket.OPEN) {
        return;
      }
      this.logger.error('socket error from deviceside ', { error: stringify(error) });
      closeWebSocketWithTruncateReason(webSocket, 1001, error);
    });
  }

  private addSendListener(webSocket: WebSocket, getContext: () => Context | null) {
    let sendSeq = 0;
    webSocket.addEventListener('message', async (event: MessageEvent<ArrayBuffer>) => {
      this.logger.verbose('message');
      const { data } = event;
      const base64 = Buffer.from(data).toString('base64');
      const context = getContext();
      if (!context) {
        for await (const _ of loop(1000, 60)) {
          if (context) {
            break;
          }
        }
        if (!context) {
          closeWebSocketWithTruncateReason(webSocket, 1001, 'proxy to device failed');
          return;
        }
      }
      if (Date.now() - context.lastWdSendTime > 1000 * 5) {
        this.remoteGamiumService
          .refreshCommandTimeout(this.remoteWebDriverService, context.organizationId, context.projectId, context.deviceId, context.deviceSerial, context.dto!.sessionId)
          .catch((error) => {
            this.logger.error('refreshCommandTimeout error', { error: stringify(error) });
          });
        context.lastWdSendTime = Date.now();
      }

      sendSeq = sendSeq + 1;
      this.logger.info(`TcpRelayRequest cb - seq: ${sendSeq}, ds: ${base64.length}`);

      await context.proxy
        .send({
          seq: sendSeq,
          encodedData: base64,
        })
        .catch((error) => {
          this.logger.error('send to deviceside error', { error: stringify(error) });
          closeWebSocketWithTruncateReason(webSocket, 1001, error);
        });
    });
  }

  handleDisconnect(webSocket: WebSocket): void {
    this.logger.info('RemoteGamiumGateway.handleDisconnect');
  }

  async pullDetach(context: Context, webSocket: WebSocket): Promise<void> {
    if (!context) {
      return;
    }
    let expectedSeq = 1;
    const buffer: TcpRelayResponse[] = [];

    const flushBuffer = () => {
      const target = buffer.find((message) => {
        if (message.seq !== expectedSeq) {
          return false;
        }
        return true;
      });
      if (!target) {
        return;
      }

      expectedSeq = expectedSeq + 1;
      const base64 = Buffer.from(target.encodedData, 'base64');
      webSocket.send(base64);
      flushBuffer();
    };
    for await (const message of context.proxy.receive()) {
      if (message instanceof WebSocketProxyReceiveClose) {
        this.logger.info('socket closed from deviceside', { code: message.code, reason: message.reason });
        closeWebSocketWithTruncateReason(webSocket, message.code, message.reason);
        break;
      }
      this.logger.info(`TcpRelayResponse cb - seq: ${message.seq}, ds: ${message.encodedData.length}`);
      buffer.push(message);
      flushBuffer();
    }
  }
}
