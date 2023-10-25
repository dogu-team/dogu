import { CloudLicenseBase, DevicePropCamel, DeviceUsageState, LiveSessionCreateRequestBodyDto, LiveSessionFindQueryDto, OrganizationPropCamel } from '@dogu-private/console';
import { LiveSessionActiveStates, LiveSessionId, LiveSessionState, OrganizationId } from '@dogu-private/types';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { DataSource, EntityManager, In } from 'typeorm';
import { v4 } from 'uuid';

import { config } from '../../config';
import { Device } from '../../db/entity/device.entity';
import { LiveSession } from '../../db/entity/live-session.entity';
import { Organization } from '../../db/entity/organization.entity';
import { CloudLicenseService } from '../../enterprise/module/license/cloud-license.service';
import { DoguLogger } from '../logger/logger';
import { DeviceCommandService } from '../organization/device/device-command.service';

@Injectable()
export class LiveSessionService {
  private readonly subscriber: Redis;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRedis()
    private readonly redis: Redis,
    private readonly deviceCommandService: DeviceCommandService,
    private readonly cloudLicenseService: CloudLicenseService,
    private readonly logger: DoguLogger,
  ) {
    this.subscriber = redis.duplicate();
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

  async createOrReject(body: LiveSessionCreateRequestBodyDto, cloudLicense: CloudLicenseBase): Promise<LiveSession> {
    const { organizationId, deviceModel, deviceVersion } = body;
    return await this.dataSource.manager.transaction(async (manager) => {
      const isLiveTestingSubscribing = await LiveSessionService.validateCloudLicense(manager, organizationId, cloudLicense);

      const device = await manager
        .getRepository(Device)
        .createQueryBuilder(Device.name)
        .leftJoinAndSelect(`${Device.name}.${DevicePropCamel.organization}`, Organization.name)
        .where(`${Organization.name}.${OrganizationPropCamel.shareable} = :shareable`, { shareable: true })
        .andWhere({
          model: deviceModel,
          version: deviceVersion,
          usageState: DeviceUsageState.AVAILABLE,
        })
        .getOne();

      if (!device) {
        throw new NotFoundException(
          `Device not found for organizationId: ${organizationId}, deviceModel: ${deviceModel}, deviceVersion: ${deviceVersion} and usageState: ${DeviceUsageState.AVAILABLE}`,
        );
      }

      device.usageState = DeviceUsageState.IN_USE;
      await manager.getRepository(Device).save(device);
      this.logger.debug('Device usageState updated', { device });

      const created = manager.getRepository(LiveSession).create({
        liveSessionId: v4(),
        state: LiveSessionState.CREATED,
        organizationId,
        deviceId: device.deviceId,
      });
      await this.updateHeartbeat(created.liveSessionId);
      const saved = await manager.getRepository(LiveSession).save(created);
      this.logger.debug('LiveSession created', { saved });
      if (!isLiveTestingSubscribing) {
        await this.startUpdateRemainingFreeSeconds(cloudLicense.cloudLicenseId, saved.liveSessionId);
      }

      return saved;
    });
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
    await this.redis.set(config.redis.key.liveSessionHeartbeat(liveSessionId), Date.now());
    await this.redis.expire(config.redis.key.liveSessionHeartbeat(liveSessionId), config.liveSession.heartbeat.allowedSeconds);
  }

  async subscribeCloseWaitEvent(liveSessionId: LiveSessionId, onMessage: (message: string) => void): Promise<() => Promise<void>> {
    const thisChannel = config.redis.key.liveSessionCloseWaitEvent(liveSessionId);
    const onMessageImpl = (channel: string, message: string) => {
      if (channel === thisChannel) {
        onMessage(message);
      }
    };
    this.subscriber.on('message', onMessageImpl);
    await this.subscriber.subscribe(config.redis.key.liveSessionCloseWaitEvent(liveSessionId));
    const unsubscribe = async () => {
      await this.subscriber.unsubscribe(config.redis.key.liveSessionCloseWaitEvent(liveSessionId));
      this.subscriber.removeListener('message', onMessageImpl);
    };
    return unsubscribe;
  }

  async publishCloseWaitEvent(liveSessionId: LiveSessionId, message: string): Promise<void> {
    await this.redis.publish(config.redis.key.liveSessionCloseWaitEvent(liveSessionId), message);
  }

  async subscribeCloseEvent(liveSessionId: LiveSessionId, onMessage: (message: string) => void): Promise<() => Promise<void>> {
    const thisChannel = config.redis.key.liveSessionCloseEvent(liveSessionId);
    const onMessageImpl = (channel: string, message: string) => {
      if (channel === thisChannel) {
        onMessage(message);
      }
    };
    this.subscriber.on('message', onMessageImpl);
    await this.subscriber.subscribe(config.redis.key.liveSessionCloseEvent(liveSessionId));
    const unsubscribe = async () => {
      await this.subscriber.unsubscribe(config.redis.key.liveSessionCloseEvent(liveSessionId));
      this.subscriber.removeListener('message', onMessageImpl);
    };
    return unsubscribe;
  }

  async publishCloseEvent(liveSessionId: LiveSessionId, message: string): Promise<void> {
    await this.redis.publish(config.redis.key.liveSessionCloseEvent(liveSessionId), message);
  }

  async isLiveSessionExists(liveSessionId: LiveSessionId): Promise<boolean> {
    const heartbeatExists = await this.redis.exists(config.redis.key.liveSessionHeartbeat(liveSessionId));
    const participantsCount = await this.redis.get(config.redis.key.liveSessionParticipantsCount(liveSessionId));
    return heartbeatExists !== 0 && Number(participantsCount) > 0;
  }

  /**
   * @description do NOT access this.dataSource in this method
   */
  async closeInTransaction(manager: EntityManager, liveSessions: LiveSession[]): Promise<LiveSession[]> {
    liveSessions.forEach((liveSession) => {
      liveSession.state = LiveSessionState.CLOSED;
      liveSession.closedAt = new Date();
    });
    const closeds = await manager.getRepository(LiveSession).save(liveSessions);

    this.logger.debug('LiveSessionService.close.liveSessions', {
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
    this.logger.debug('LiveSessionService.close.devices', {
      devices,
    });

    devices.forEach((device) => {
      this.deviceCommandService.reset(device.organizationId, device.deviceId, device.serial).catch((error) => {
        this.logger.error('LiveSessionService.close.reset error', {
          error,
          device,
        });
      });
    });

    return closeds;
  }

  async closeByLiveSessionId(liveSessionId: LiveSessionId): Promise<LiveSession> {
    const liveSession = await this.dataSource.getRepository(LiveSession).findOne({ where: { liveSessionId } });

    if (!liveSession) {
      throw new NotFoundException(`LiveSession not found for liveSessionId: ${liveSessionId}`);
    }

    if (liveSession.state === LiveSessionState.CLOSED) {
      return liveSession;
    }

    const closedSession = await this.dataSource.transaction(async (manager) => {
      const rv = await this.closeInTransaction(manager, [liveSession]);
      return rv[0];
    });

    await this.publishCloseEvent(closedSession.liveSessionId, 'closed!');
    return closedSession;
  }

  async startUpdateRemainingFreeSeconds(cloudLicenseId: string, liveSessionId: string): Promise<void> {
    const webSocketClientId = LiveSessionService.createLiveSessionWebSocketClientId(cloudLicenseId, liveSessionId);
    this.cloudLicenseService.startUpdateRemainingFreeSeconds(cloudLicenseId, webSocketClientId, {
      onOpen: async (close) => {
        this.subscribeCloseEvent(liveSessionId, () => {
          close();
        });
      },
      onMessage: async (message) => {
        if (message.expired) {
          this.logger.debug('LiveSessionService.startUpdateRemainingFreeSeconds.message expired', {
            cloudLicenseId,
            liveSessionId,
            message,
          });
          await this.closeByLiveSessionId(liveSessionId);
          return;
        }
      },
    });
  }

  static async validateCloudLicense(manager: EntityManager, organizationId: OrganizationId, cloudLicense: CloudLicenseBase): Promise<boolean> {
    const activeCount = await manager //
      .getRepository(LiveSession)
      .count({
        where: {
          organizationId,
          state: In(LiveSessionActiveStates),
        },
      });
    if (activeCount >= cloudLicense.liveTestingParallelCount) {
      throw new ForbiddenException(`Live testing parallel count exceeded. liveTestingParallelCount: ${cloudLicense.liveTestingParallelCount}`);
    }

    const isLiveTestingSubscribing = cloudLicense.cloudSubscriptionItems?.find((item) => item.type === 'live-testing');
    if (!isLiveTestingSubscribing && cloudLicense.remainingFreeSeconds <= 0) {
      throw new ForbiddenException(`Live testing is not subscribed. remainingFreeSeconds: ${cloudLicense.remainingFreeSeconds}`);
    }

    return !!isLiveTestingSubscribing;
  }

  static createLiveSessionWebSocketClientId(cloudLicenseId: string, liveSessionId: string): string {
    return `${cloudLicenseId}:${liveSessionId}`;
  }
}
