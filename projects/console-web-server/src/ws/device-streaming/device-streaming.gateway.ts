import { WebSocketProxyReceiveClose } from '@dogu-private/console-host-agent';
import { closeWebSocketWithTruncateReason, stringify, transformAndValidate } from '@dogu-tech/common';
import { Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import { DoguLogger } from '../../module/logger/logger';
import { DeviceCommandService } from '../../module/organization/device/device-command.service';
import { DeviceStatusService } from '../../module/organization/device/device-status.service';
import { DeviceStreamingOfferDto } from '../../module/organization/device/dto/device.dto';
import { WsCommonService } from '../common/ws-common.service';
import { DeviceStreamingQueryDto } from './device-streaming.dto';

@WebSocketGateway({ path: '/ws/device-streaming' })
export class DeviceStreamingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly deviceCommandService: DeviceCommandService,
    private readonly logger: DoguLogger,
    private readonly deviceStatusService: DeviceStatusService,
    @Inject(WsCommonService)
    private readonly wsCommonService: WsCommonService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    // validate url query
    const url = new URL(`http:${incomingMessage.url ?? ''}`);
    const organizationQuery = url.searchParams.get('organizationId');
    const deviceQuery = url.searchParams.get('deviceId');

    const deviceStreamingQueryDto = await transformAndValidate(DeviceStreamingQueryDto, {
      organizationId: organizationQuery,
      deviceId: deviceQuery,
    });
    const { deviceId, organizationId } = deviceStreamingQueryDto;
    const timerId = setTimeout(() => {
      closeWebSocketWithTruncateReason(webSocket, 1000, 'Timeout');
    }, 100 * 1000);

    webSocket.addEventListener('open', async (event) => {
      this.logger.verbose('open');
    });
    webSocket.addEventListener('error', (event) => {
      this.logger.verbose('error');
    });
    webSocket.addEventListener('close', (event) => {
      clearTimeout(timerId);
      const { code, reason } = event;
      this.logger.verbose('close', { code, reason });
    });
    webSocket.addEventListener('message', async (event: MessageEvent<string>) => {
      this.logger.verbose('message');
      const rv = await this.wsCommonService.validateDeviceAccessPermission(incomingMessage, this.dataSource, organizationId, deviceId, this.logger);
      if (rv.result === false) {
        this.logger.info(`DeviceStreamingGateway. handleConnection. ${rv.message}`);
        // webSocket.close(1003, 'Unauthorized');
        closeWebSocketWithTruncateReason(webSocket, 1003, 'Unauthorized');
      }
      const { data } = event;
      this.onMessage(webSocket, data).catch((error) => {
        this.logger.error('error', { error: stringify(error) });
        closeWebSocketWithTruncateReason(webSocket, 1001, error);
      });
    });
  }

  handleDisconnect(webSocket: WebSocket): void {
    this.logger.info('handleDisconnect');
  }

  async onMessage(webSocket: WebSocket, data: string): Promise<void> {
    const param = await transformAndValidate(DeviceStreamingOfferDto, JSON.parse(data));
    for await (const answer of this.deviceCommandService.startDeviceStreamingWithTrickle(param)) {
      if (answer instanceof WebSocketProxyReceiveClose) {
        closeWebSocketWithTruncateReason(webSocket, answer.code, answer.reason);
        break;
      }
      this.logger.info('message', { answer });
      webSocket.send(JSON.stringify(answer));
    }
  }
}
