import { DeviceUsageState } from '@dogu-private/console';
import { LiveSessionState } from '@dogu-private/types';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { DataSource, In } from 'typeorm';
import { config } from '../../config';
import { Device } from '../../db/entity/device.entity';
import { LiveSession } from '../../db/entity/live-session.entity';
import { DoguLogger } from '../logger/logger';
import { EventConsumer } from './event.consumer';
import { EventProducer } from './event.producer';

@Injectable()
export class LiveSessionUpdater implements OnModuleInit, OnModuleDestroy {
  private readonly eventProducer: EventProducer;
  private readonly eventConsumer: EventConsumer;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRedis()
    redis: Redis,
    private readonly logger: DoguLogger,
  ) {
    this.eventProducer = new EventProducer({
      redis,
      logger,
      key: config.redis.key.updateLiveSession,
      produceInterval: 1000,
      eventExpireTimeout: 60 * 1000,
      onProduce: async () => {
        return '0';
      },
    });
    this.eventConsumer = new EventConsumer({
      redis,
      logger,
      key: config.redis.key.updateLiveSession,
      consumeInterval: 1000,
      onConsume: () => this.update(),
    });
  }

  onModuleInit() {
    this.eventProducer.start();
    this.eventConsumer.start();
  }

  onModuleDestroy() {
    this.eventProducer.stop();
    this.eventConsumer.stop();
  }

  private async update(): Promise<void> {
    await this.createdToCloseWait();
    await this.closeWaitToCreatedOrClosed();
  }

  private async createdToCloseWait(): Promise<void> {
    await this.dataSource.manager.transaction(async (manager) => {
      const createds = await manager.getRepository(LiveSession).find({
        where: {
          state: LiveSessionState.CREATED,
        },
      });

      const newCloseWaits = createds
        .filter((liveSession) => {
          const allowedTime = new Date().getTime() - config.liveSession.heartbeat.allowedMilliseconds;
          if (liveSession.heartbeat) {
            // old heartbeat
            return liveSession.heartbeat.getTime() < allowedTime;
          } else {
            // no heartbeat
            return liveSession.createdAt.getTime() < allowedTime;
          }
        })
        .map((liveSession) => {
          liveSession.state = LiveSessionState.CLOSE_WAIT;
          liveSession.closeWaitAt = new Date();
          return liveSession;
        });

      if (newCloseWaits.length > 0) {
        await manager.save(newCloseWaits);
      }
    });
  }

  private async closeWaitToCreatedOrClosed(): Promise<void> {
    await this.dataSource.manager.transaction(async (manager) => {
      const closeWaits = await manager //
        .getRepository(LiveSession)
        .find({
          where: {
            state: LiveSessionState.CLOSE_WAIT,
          },
        });

      const toCreateds = closeWaits
        .filter((liveSession) => {
          const allowedTime = new Date().getTime() - config.liveSession.closeWait.allowedMilliseconds;
          if (liveSession.heartbeat) {
            // still heartbeat
            return liveSession.heartbeat.getTime() >= allowedTime;
          } else {
            // no heartbeat
            return false;
          }
        })
        .map((liveSession) => {
          liveSession.state = LiveSessionState.CREATED;
          liveSession.closeWaitAt = null;
          return liveSession;
        });

      if (toCreateds.length > 0) {
        await manager.save(toCreateds);
      }

      const toCloses = closeWaits
        .filter((liveSession) => toCreateds.findIndex((toCreated) => toCreated.liveSessionId === liveSession.liveSessionId) === -1)
        .map((liveSession) => {
          liveSession.state = LiveSessionState.CLOSED;
          liveSession.closedAt = new Date();
          return liveSession;
        });

      if (toCloses.length > 0) {
        await manager.save(toCloses);

        const deviceIds = toCloses.map((liveSession) => liveSession.deviceId);
        const devices = await manager.getRepository(Device).find({
          where: {
            deviceId: In(deviceIds),
          },
        });
        devices.forEach((device) => {
          device.usageState = DeviceUsageState.AVAILABLE;
          return device;
        });
        await manager.save(devices);
      }
    });
  }
}
