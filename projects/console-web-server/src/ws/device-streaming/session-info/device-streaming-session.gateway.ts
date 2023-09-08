import { DeviceStreamingSessionInfoDto, UserBase } from '@dogu-private/console';
import { DeviceId, UserId } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, stringify, transformAndValidate } from '@dogu-tech/common';
import { Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import _ from 'lodash';
import { DataSource, In } from 'typeorm';
import { WebSocket } from 'ws';
import { User } from '../../../db/entity/user.entity';
import { DeviceStreamingSessionQueue } from '../../../module/device-streaming-session/device-streaming-session.queue';
import { DoguLogger } from '../../../module/logger/logger';
import { WsCommonService } from '../../common/ws-common.service';
import { DeviceStreamingQueryDto } from '../dto/device-streaming.dto';

const DEVICE_STREAMING_SESSION_LIVE_DELAY_COUNT = 5;

@WebSocketGateway({ path: '/ws/device-streaming-session' })
export class DeviceStreamingSessionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly logger: DoguLogger,
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

      const users = await this.dataSource.getRepository(User).find({ where: { userId: In(curUserIds) } });
      const excludePassUsers: UserBase[] = users.map((user) => {
        const { password, ...rest } = user;
        return rest;
      });

      const me: UserBase = excludePassUsers.find((user) => user.userId === userId)!;
      const orderedUsers: UserBase[] = [me, ...excludePassUsers.filter((user) => user.userId !== userId)];

      if (!_.isEqual(lastUserIds, curUserIds)) {
        const data: DeviceStreamingSessionInfoDto = {
          users: orderedUsers,
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

    const rv = await this.wsCommonService.validateDeviceAccessPermission(incomingMessage, this.dataSource, organizationId, deviceId, this.logger);
    if (rv.result === false) {
      this.logger.info(`DeviceStreamingGateway. handleConnection. ${rv.message}`);
      closeWebSocketWithTruncateReason(webSocket, 1003, 'Unauthorized');
    }

    try {
      await this.sendDeviceStreamingSession(webSocket, deviceId, rv.userId!);
      closeWebSocketWithTruncateReason(webSocket, 1000, `DeviceStreamingGateway. Pipeline is completed`);
    } catch (e) {
      this.logger.error(`DeviceStreamingGateway. sendDeviceStreamingSession. ${stringify(e)}`);
      closeWebSocketWithTruncateReason(webSocket, 1003, e);
      return;
    }
  }

  handleDisconnect(webSocket: WebSocket): void {
    this.logger.info('handleDisconnect');
  }
}
