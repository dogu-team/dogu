import { DeviceUsageState, LiveSessionCreateRequestBodyDto, LiveSessionFindQueryDto } from '@dogu-private/console';
import { LiveSessionState } from '@dogu-private/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { Device } from '../../db/entity/device.entity';
import { LiveSession } from '../../db/entity/live-session.entity';

@Injectable()
export class LiveSessionService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAllByQuery(query: LiveSessionFindQueryDto): Promise<LiveSession[]> {
    const { organizationId, deviceId, state } = query;
    const liveSessions = await this.dataSource.manager //
      .getRepository(LiveSession)
      .find({
        where: {
          organizationId,
          deviceId,
          state,
        },
      });
    return liveSessions;
  }

  async create(body: LiveSessionCreateRequestBodyDto): Promise<LiveSession> {
    const { organizationId, deviceModel, deviceVersion } = body;
    return await this.dataSource.manager.transaction(async (manager) => {
      const device = await manager.getRepository(Device).findOne({
        where: {
          organizationId,
          model: deviceModel,
          version: deviceVersion,
          usageState: DeviceUsageState.AVAILABLE,
        },
      });
      if (!device) {
        throw new NotFoundException(
          `Device not found for organizationId: ${organizationId}, deviceModel: ${deviceModel}, deviceVersion: ${deviceVersion} and usageState: ${DeviceUsageState.AVAILABLE}`,
        );
      }

      device.usageState = DeviceUsageState.IN_USE;
      await manager.getRepository(Device).save(device);

      const created = manager.getRepository(LiveSession).create({
        liveSessionId: v4(),
        state: LiveSessionState.CREATED,
        organizationId,
        deviceId: device.deviceId,
      });
      const saved = await manager.getRepository(LiveSession).save(created);
      return saved;
    });
  }
}
