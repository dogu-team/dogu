import { DeviceStreamingDto } from '@dogu-private/console';
import { WebSocketProxyReceiveClose } from '@dogu-private/console-host-agent';
import { DeviceId, UserId } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, stringify, transformAndValidate } from '@dogu-tech/common';
import { Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import _ from 'lodash';
import { DataSource, In } from 'typeorm';
import { WebSocket } from 'ws';
import { User } from '../../db/entity/user.entity';
import { DeviceStreamingSessionQueue } from '../../module/device-streaming-session/device-streaming-session.queue';
import { DoguLogger } from '../../module/logger/logger';
import { DeviceCommandService } from '../../module/organization/device/device-command.service';
import { DeviceStatusService } from '../../module/organization/device/device-status.service';
import { DeviceStreamingOfferDto } from '../../module/organization/device/dto/device.dto';
import { WsCommonService } from '../common/ws-common.service';
import { DeviceStreamingQueryDto } from './device-streaming.dto';

const DEVICE_STREAMING_SESSION_LIVE_DELAY_COUNT = 5;

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
    @Inject(DeviceStreamingSessionQueue)
    private readonly deviceStreamingSessionQueue: DeviceStreamingSessionQueue,
  ) {}

  async sendDeviceStreamingSession(webSocket: WebSocket, deviceId: DeviceId, userId: UserId): Promise<void> {
    let isRunning = true;
    let lastUserIds: UserId[] = [];
    while (isRunning) {
      if (webSocket.readyState === WebSocket.CLOSED) {
        await this.deviceStreamingSessionQueue.removeAllData(deviceId, userId);
        return;
      }

      await this.deviceStreamingSessionQueue.removeOneData(deviceId, userId);
      await this.deviceStreamingSessionQueue.pushData(deviceId, userId);

      const curSessions = await this.deviceStreamingSessionQueue.rangeParamDatas(deviceId);
      const groupByCurUserIds = _.groupBy(curSessions);
      const curUserIds = Object.keys(groupByCurUserIds);

      const lengthString = curSessions.length.toString();
      this.logger.info('sendDeviceStreamingSession:: COUNT', { lengthString });
      this.logger.info('sendDeviceStreamingSession:: CUR', { curUserIds });

      const users = await this.dataSource.getRepository(User).find({ where: { userId: In(curUserIds) } });

      if (!_.isEqual(lastUserIds, curUserIds)) {
        const data: DeviceStreamingDto = {
          streamingData: {
            type: 'USER_INFO',
            value: users,
          },
        };
        webSocket.send(JSON.stringify(data));
        lastUserIds = [...curUserIds];
      }

      await new Promise((resolve) => setTimeout(resolve, DEVICE_STREAMING_SESSION_LIVE_DELAY_COUNT * 1000));
    }
    return;
  }

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
      const rv = await this.wsCommonService.validateDeviceAccessPermission(incomingMessage, this.dataSource, organizationId, deviceId, this.logger);
      if (rv.result === false) {
        this.logger.info(`DeviceStreamingGateway. handleConnection. ${rv.message}`);
        closeWebSocketWithTruncateReason(webSocket, 1003, 'Unauthorized');
      }
      const { data } = event;

      this.onMessage(webSocket, data.toString()).catch((error) => {
        this.logger.error('error', { error: stringify(error) });
        closeWebSocketWithTruncateReason(webSocket, 1001, error);
      });

      try {
        await this.sendDeviceStreamingSession(webSocket, deviceId, rv.userId!);
        closeWebSocketWithTruncateReason(webSocket, 1000, `DeviceStreamingGateway. Pipeline is completed`);
      } catch (e) {
        this.logger.error(`DeviceStreamingGateway. sendDeviceStreamingSession. ${stringify(e)}`);
        closeWebSocketWithTruncateReason(webSocket, 1003, e);
        return;
      }
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
      const answerDto: DeviceStreamingDto = {
        streamingData: {
          type: 'ANSWER',
          value: answer.value,
        },
      };
      this.logger.info('message', { answer });
      webSocket.send(JSON.stringify(answerDto));
    }
  }
}
