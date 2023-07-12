import { DeviceId, REMOTE_TABLE_NAME, WebDriverSessionId } from '@dogu-private/types';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { Device } from '../../../db/entity/index';
import { RemoteWebDriverInfo } from '../../../db/entity/remote-webdriver-info.entity';
import { Remote } from '../../../db/entity/remote.entity';
import { DoguLogger } from '../../logger/logger';
import { DeviceStatusService } from '../../organization/device/device-status.service';
import { CreateRemoteWebDriverInfoSessionDto } from './dto/remote-webdriver.dto';

@Injectable()
export class RemoteWebDriverInfoService {
  constructor(
    @Inject(forwardRef(() => DeviceStatusService))
    private readonly deviceStatusService: DeviceStatusService,
    private readonly logger: DoguLogger,
  ) {}

  async createSessionToDevice(manager: EntityManager, deviceId: DeviceId, dto: CreateRemoteWebDriverInfoSessionDto): Promise<void> {
    const sessionId = dto.sessionId;
    const remoteWdaInfo = await manager.getRepository(RemoteWebDriverInfo).findOne({ where: { sessionId }, withDeleted: true });

    if (remoteWdaInfo && remoteWdaInfo.deletedAt === null) {
      throw new HttpException(`This device already has this session. : ${dto.sessionId}`, HttpStatus.BAD_REQUEST);
    }

    if (remoteWdaInfo && remoteWdaInfo.deletedAt !== null) {
      await manager.getRepository(RemoteWebDriverInfo).recover(remoteWdaInfo);
      return;
    }

    const device = await manager.getRepository(Device).findOne({ where: { deviceId } });

    if (!device) {
      throw new HttpException(`This device does not exists. : ${deviceId}`, HttpStatus.BAD_REQUEST);
    }

    const remoteData = manager.getRepository(Remote).create({ remoteId: v4(), deviceId });
    const remoteWdaInfoData = manager.getRepository(RemoteWebDriverInfo).create({ remoteWebDriverInfoId: v4(), sessionId, remoteId: remoteData.remoteId });

    await manager.getRepository(Remote).save(remoteData);
    await manager.getRepository(RemoteWebDriverInfo).save(remoteWdaInfoData);
    return;
  }

  async findDeviceBySessionIdAndMark(manager: EntityManager, sessionId: WebDriverSessionId): Promise<DeviceId> {
    const remoteWdaInfo = await manager.getRepository(RemoteWebDriverInfo).findOne(
      { where: { sessionId }, relations: [REMOTE_TABLE_NAME] }, //
    );

    if (!remoteWdaInfo) {
      throw new HttpException(`This session not found. : ${sessionId}`, HttpStatus.NOT_FOUND);
    }
    if (remoteWdaInfo.deletedAt !== null) {
      throw new HttpException(`This session deleted. : ${sessionId}`, HttpStatus.BAD_REQUEST);
    }
    remoteWdaInfo.remote!.heartbeat = new Date();
    await manager.getRepository(RemoteWebDriverInfo).save(remoteWdaInfo);
    await manager.getRepository(Remote).save(remoteWdaInfo.remote!);

    return remoteWdaInfo.remote!.deviceId;
  }

  async deleteSession(manager: EntityManager, sessionId: WebDriverSessionId): Promise<void> {
    const sessionAndDevice = await manager.getRepository(RemoteWebDriverInfo).findOne({ where: { sessionId }, withDeleted: false });

    if (!sessionAndDevice || sessionAndDevice.deletedAt !== null) {
      throw new HttpException(`This session not exist. : ${sessionId}`, HttpStatus.BAD_REQUEST);
    }
    await manager.getRepository(RemoteWebDriverInfo).softRemove(sessionAndDevice);
    return;
  }
}
