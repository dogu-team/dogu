import { DeviceId, WebDriverSessionId } from '@dogu-private/types';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Device } from '../../db/entity/device.entity';
import { DeviceAndWebDriver } from '../../db/entity/relations/device-and-webdriver.entity';
import { DoguLogger } from '../logger/logger';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { CreateDeviceWebDriverSessionDto } from './dto/device-webdriver.dto';

@Injectable()
export class DeviceWebDriverService {
  constructor(
    @Inject(forwardRef(() => DeviceStatusService))
    private readonly deviceStatusService: DeviceStatusService,
    private readonly logger: DoguLogger,
  ) {}

  async createSessionToDevice(manager: EntityManager, deviceId: DeviceId, dto: CreateDeviceWebDriverSessionDto): Promise<void> {
    const sessionId = dto.sessionId;
    const sessionAndDevice = await manager.getRepository(DeviceAndWebDriver).findOne({ where: { deviceId, sessionId }, withDeleted: true });

    if (sessionAndDevice && sessionAndDevice.deletedAt === null) {
      throw new HttpException(`This device already has this session. : ${dto.sessionId}`, HttpStatus.BAD_REQUEST);
    }

    if (sessionAndDevice && sessionAndDevice.deletedAt !== null) {
      await manager.getRepository(DeviceAndWebDriver).recover(sessionAndDevice);
      return;
    }

    const device = await manager.getRepository(Device).findOne({ where: { deviceId } });

    if (!device) {
      throw new HttpException(`This device does not exists. : ${deviceId}`, HttpStatus.BAD_REQUEST);
    }

    const newData = manager.getRepository(DeviceAndWebDriver).create({ deviceId, sessionId });
    await manager.getRepository(DeviceAndWebDriver).save(newData);
    return;
  }

  async findDeviceBySessionId(manager: EntityManager, sessionId: WebDriverSessionId): Promise<DeviceId> {
    const sessionAndDevice = await manager.getRepository(DeviceAndWebDriver).findOne({ where: { sessionId }, withDeleted: false });

    if (!sessionAndDevice) {
      throw new HttpException(`This session not found. : ${sessionId}`, HttpStatus.NOT_FOUND);
    }
    if (sessionAndDevice.deletedAt !== null) {
      throw new HttpException(`This session deleted. : ${sessionId}`, HttpStatus.BAD_REQUEST);
    }

    return sessionAndDevice.deviceId;
  }

  async deleteSession(manager: EntityManager, sessionId: WebDriverSessionId): Promise<void> {
    const sessionAndDevice = await manager.getRepository(DeviceAndWebDriver).findOne({ where: { sessionId }, withDeleted: false });

    if (!sessionAndDevice || sessionAndDevice.deletedAt !== null) {
      throw new HttpException(`This session not exist. : ${sessionId}`, HttpStatus.BAD_REQUEST);
    }
    await manager.getRepository(DeviceAndWebDriver).softRemove(sessionAndDevice);
    return;
  }
}
