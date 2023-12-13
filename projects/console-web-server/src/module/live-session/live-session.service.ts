import { CloudLicenseBase, DevicePropCamel, DeviceUsageState, LiveSessionCreateRequestBodyDto, LiveSessionFindQueryDto, OrganizationPropCamel } from '@dogu-private/console';
import { DeviceConnectionState, LiveSessionId, LiveSessionState } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In } from 'typeorm';
import { v4 } from 'uuid';

import { config } from '../../config';
import { Device } from '../../db/entity/device.entity';
import { LiveSession } from '../../db/entity/live-session.entity';
import { Organization } from '../../db/entity/organization.entity';
import { Message, RetryTransaction } from '../../db/utils';
import { CloudLicenseSerializable } from '../../enterprise/module/license/cloud-license.serializables';
import { CloudLicenseService } from '../../enterprise/module/license/cloud-license.service';
import { DoguLogger } from '../logger/logger';
import { DeviceCommandService } from '../organization/device/device-command.service';
import { RedisService } from '../redis/redis.service';
import { LiveSessionSubscriber } from './live-session.subscriber';

export function applyLiveSessionToClosed(liveSession: LiveSession): LiveSession {
  liveSession.state = LiveSessionState.CLOSED;
  liveSession.closedAt = new Date();
  return liveSession;
}

export async function closeInTransaction(
  logger: DoguLogger,
  deviceCommandService: DeviceCommandService,
  manager: EntityManager,
  liveSessions: LiveSession[],
): Promise<LiveSession[]> {
  const toCloseds = liveSessions.map((liveSession) => applyLiveSessionToClosed(liveSession));
  const closeds = await manager.getRepository(LiveSession).save(toCloseds);

  logger.debug('LiveSessionService.close.liveSessions', {
    liveSessions,
  });

  const deviceIds = liveSessions.map((liveSession) => liveSession.deviceId);
  const devices = await manager.getRepository(Device).find({
    where: {
      deviceId: In(deviceIds),
    },
  });
  devices.forEach((device) => {
    device.usageState = DeviceUsageState.PREPARING;
  });
  await manager.getRepository(Device).save(devices);
  logger.debug('LiveSessionService.close.devices', {
    devices,
  });

  devices.forEach((device) => {
    deviceCommandService.reset(device.organizationId, device.deviceId, device.serial).catch((error) => {
      logger.error('LiveSessionService.close.reset error', {
        error: errorify(error),
        device,
      });
    });
  });

  return closeds;
}

@Injectable()
export class LiveSessionService {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly redis: RedisService,
    private readonly deviceCommandService: DeviceCommandService,
    private readonly cloudLicenseService: CloudLicenseService,
    private readonly liveSessionSubscriber: LiveSessionSubscriber,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

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

  async create(body: LiveSessionCreateRequestBodyDto, cloudLicense: CloudLicenseBase): Promise<LiveSession> {
    const { organizationId, deviceModel, deviceVersion } = body;
    const liveSession = await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      await CloudLicenseSerializable.validateLiveTesting(context, cloudLicense);

      const device = await manager
        .getRepository(Device)
        .createQueryBuilder(Device.name)
        .leftJoinAndSelect(`${Device.name}.${DevicePropCamel.organization}`, Organization.name)
        .where(`${Organization.name}.${OrganizationPropCamel.shareable} = :shareable`, { shareable: true })
        .andWhere({
          model: deviceModel,
          version: deviceVersion,
          usageState: DeviceUsageState.AVAILABLE,
          connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED,
        })
        .getOne();

      if (!device) {
        throw new NotFoundException(
          `Device not found for organizationId: ${organizationId}, deviceModel: ${deviceModel}, deviceVersion: ${deviceVersion} and usageState: ${DeviceUsageState.AVAILABLE}`,
        );
      }

      device.usageState = DeviceUsageState.IN_USE;
      await manager.save(device);
      this.logger.debug('Device usageState updated', { device });

      const created = manager.getRepository(LiveSession).create({
        liveSessionId: v4(),
        state: LiveSessionState.CREATED,
        organizationId,
        deviceId: device.deviceId,
      });

      const saved = await manager.save(created);
      return saved;
    });

    this.logger.debug('LiveSession created', { liveSession });
    await this.updateHeartbeat(liveSession.liveSessionId);

    const stopUpdate = await this.cloudLicenseService.startUpdate({
      organizationId,
      planType: 'live-testing',
      key: 'liveSessionId',
      value: liveSession.liveSessionId,
    });

    {
      const handler = (message: Message<LiveSession>): void => {
        if (message.data.liveSessionId !== liveSession.liveSessionId) {
          return;
        }

        if (message.data.state !== LiveSessionState.CLOSED) {
          return;
        }

        this.liveSessionSubscriber.emitter.off('message', handler);
        stopUpdate();
      };
      this.liveSessionSubscriber.emitter.on('message', handler);
    }

    return liveSession;
  }

  async increaseParticipantsCount(liveSessionId: LiveSessionId): Promise<void> {
    const count = await this.redis.incr(config.redis.key.liveSessionParticipantsCount(liveSessionId));
    await this.redis.expire(config.redis.key.liveSessionParticipantsCount(liveSessionId), config.liveSession.participantsCount.allowedSeconds);
    this.logger.debug('LiveSessionHeartbeatGateway.increaseParticipantsCount', { liveSessionId, count });
  }

  async decreaseParticipantsCount(liveSessionId: LiveSessionId): Promise<number> {
    const count = await this.redis.decr(config.redis.key.liveSessionParticipantsCount(liveSessionId));
    await this.redis.expire(config.redis.key.liveSessionParticipantsCount(liveSessionId), config.liveSession.participantsCount.allowedSeconds);
    this.logger.debug('LiveSessionHeartbeatGateway.decreaseParticipantsCount', { liveSessionId, count });
    return count;
  }

  async updateHeartbeat(liveSessionId: LiveSessionId): Promise<void> {
    const key = config.redis.key.liveSessionHeartbeat(liveSessionId);
    await this.redis.set(key, Date.now());
    await this.redis.expire(key, config.liveSession.heartbeat.allowedSeconds);
  }

  async isLiveSessionExists(liveSessionId: LiveSessionId): Promise<boolean> {
    const participantsCount = await this.redis.get(config.redis.key.liveSessionParticipantsCount(liveSessionId));
    if (Number(participantsCount) <= 0) {
      return false;
    }

    const heartbeatExists = await this.redis.exists(config.redis.key.liveSessionHeartbeat(liveSessionId));
    return heartbeatExists !== 0;
  }

  /**
   * @description do NOT access this.dataSource in this method
   */
  async closeByLiveSessionId(liveSessionId: LiveSessionId): Promise<LiveSession> {
    const liveSession = await this.dataSource.getRepository(LiveSession).findOne({ where: { liveSessionId } });

    if (!liveSession) {
      throw new NotFoundException(`LiveSession not found for liveSessionId: ${liveSessionId}`);
    }

    if (liveSession.state === LiveSessionState.CLOSED) {
      return liveSession;
    }

    const closedSession = await this.dataSource.transaction(async (manager) => {
      const rv = await closeInTransaction(this.logger, this.deviceCommandService, manager, [liveSession]);
      return rv[0];
    });

    return closedSession;
  }
}
