import { WebSocketProxyReceiveClose } from '@dogu-private/console-host-agent';
import { closeWebSocketWithTruncateReason, stringify, transformAndValidate } from '@dogu-tech/common';
import { Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { DataSource } from 'typeorm';
import { WebSocket } from 'ws';
import { Device } from '../../../db/entity/device.entity';
import { DoguLogger } from '../../../module/logger/logger';
import { DeviceCommandService } from '../../../module/organization/device/device-command.service';
import { DeviceStreamingOfferDto } from '../../../module/organization/device/dto/device.dto';
import { WsCommonService } from '../../common/ws-common.service';
import { DeviceStreamingQueryDto } from '../dto/device-streaming.dto';

@WebSocketGateway({ path: '/ws/device-streaming-trickle-exchanger' })
export class DeviceStreamingTrickleExchangerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly deviceCommandService: DeviceCommandService,
    private readonly logger: DoguLogger,
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
    const liveSessionQuery = url.searchParams.get('liveSessionId');

    const deviceStreamingQueryDto = await transformAndValidate(DeviceStreamingQueryDto, {
      organizationId: organizationQuery,
      deviceId: deviceQuery,
    });
    const { deviceId, organizationId } = deviceStreamingQueryDto;

    webSocket.addEventListener('open', async (event) => {
      this.logger.verbose('open');
    });
    webSocket.addEventListener('error', (event) => {
      this.logger.verbose('error');
    });
    webSocket.addEventListener('close', (event) => {
      const { code, reason } = event;
      this.logger.verbose('close', { code, reason });
    });
    webSocket.addEventListener('message', async (event) => {
      this.logger.verbose('message');

      const validateResult = await this.wsCommonService.validateDeviceAccessPermission(incomingMessage, this.dataSource, organizationId, deviceId, liveSessionQuery);

      if (validateResult.result === false) {
        this.logger.info(`DeviceStreamingGateway. handleConnection. ${validateResult.message}`);
        closeWebSocketWithTruncateReason(webSocket, 1003, 'Unauthorized');
      }
      const { data } = event;
      this.onMessage(webSocket, data.toString()).catch((error) => {
        this.logger.error('error', { error: stringify(error) });
        closeWebSocketWithTruncateReason(webSocket, 1001, error);
      });
    });
  }

  handleDisconnect(webSocket: WebSocket): void {
    this.logger.info('DeviceStreamingGateway.handleDisconnect');
  }

  async onMessage(webSocket: WebSocket, data: string): Promise<void> {
    const param = await transformAndValidate(DeviceStreamingOfferDto, JSON.parse(data));

    // change organizationId due to cloud live session: user organization and device organization is different
    const device = await this.dataSource.getRepository(Device).findOne({ where: { deviceId: param.deviceId } });
    if (!device) {
      throw new Error(`device not found. deviceId: ${param.deviceId}`);
    }

    const { organizationId } = device;
    param.organizationId = organizationId;

    for await (const answer of this.deviceCommandService.startDeviceStreamingWithTrickle(param)) {
      if (answer instanceof WebSocketProxyReceiveClose) {
        closeWebSocketWithTruncateReason(webSocket, answer.code, answer.reason);
        break;
      }
      webSocket.send(JSON.stringify(answer));
    }
  }
}
