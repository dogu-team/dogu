import { DeviceConnectionState, LiveSessionState } from '@dogu-private/types';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Not } from 'typeorm';

import { config } from '../../config';
import { LiveSession } from '../../db/entity/live-session.entity';
import { CloudLicenseService } from '../../enterprise/module/license/cloud-license.service';
import { EventConsumer } from '../event/event.consumer';
import { EventProducer } from '../event/event.producer';
import { applyLiveSessionToClosed, closeInTransaction, LiveSessionService } from '../live-session/live-session.service';
import { DoguLogger } from '../logger/logger';
import { DeviceCommandService } from '../organization/device/device-command.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class LiveSessionUpdater implements OnModuleInit, OnModuleDestroy {
  private readonly eventProducer: EventProducer;
  private readonly eventConsumer: EventConsumer;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    redis: RedisService,
    private readonly logger: DoguLogger,
    private readonly liveSessionService: LiveSessionService,
    private readonly deviceCommandService: DeviceCommandService,
    private readonly cloudLicenseService: CloudLicenseService,
  ) {
    this.eventProducer = new EventProducer({
      redis,
      logger,
      key: config.redis.key.updateLiveSession,
      produceInterval: 1000,
      eventExpireTimeout: 60 * 1000,
      onProduce: async (): Promise<string> => {
        return Promise.resolve('0');
      },
    });
    this.eventConsumer = new EventConsumer({
      redis,
      logger,
      key: config.redis.key.updateLiveSession,
      consumeInterval: 1000,
      onConsume: async (): Promise<void> => this.update(),
    });
  }

  onModuleInit(): void {
    this.eventProducer.start();
    this.eventConsumer.start();
  }

  onModuleDestroy(): void {
    this.eventProducer.stop();
    this.eventConsumer.stop();
  }

  private async update(): Promise<void> {
    await this.toClosedIfDeviceDisconnected();
    await this.createdToCloseWait();
    await this.closeWaitToCreatedOrClosed();
  }

  private async toClosedIfDeviceDisconnected(): Promise<void> {
    await this.dataSource.manager.transaction(async (manager) => {
      const disconnecteds = await manager.getRepository(LiveSession).find({
        where: {
          state: Not(LiveSessionState.CLOSED),
          device: {
            connectionState: Not(DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED),
          },
        },
        relations: {
          device: true,
        },
      });

      if (disconnecteds.length === 0) {
        return [];
      }

      const toCloseds = disconnecteds.map((liveSession) => applyLiveSessionToClosed(liveSession));
      const closeds = await manager.save(toCloseds);
      return closeds;
    });
  }

  private async createdToCloseWait(): Promise<void> {
    await this.dataSource.manager.transaction(async (manager) => {
      const createds = await manager.getRepository(LiveSession).find({
        where: {
          state: LiveSessionState.CREATED,
        },
      });

      const newCloseWaits: LiveSession[] = [];
      for (const liveSession of createds) {
        const allowedSeconds = new Date().getTime() - config.liveSession.heartbeat.allowedSeconds;
        if (liveSession.createdAt.getTime() < allowedSeconds) {
          const isLiveSessionExists = await this.liveSessionService.isLiveSessionExists(liveSession.liveSessionId);
          if (isLiveSessionExists) {
            // ok
          } else {
            liveSession.state = LiveSessionState.CLOSE_WAIT;
            liveSession.closeWaitAt = new Date();
            newCloseWaits.push(liveSession);
          }
        } else {
          // ok
        }
      }

      if (newCloseWaits.length > 0) {
        await manager.save(newCloseWaits);
        this.logger.debug('LiveSessionUpdater: createdToCloseWait', {
          newCloseWaits,
        });
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

      const toCreateds: LiveSession[] = [];
      for (const liveSession of closeWaits) {
        const isLiveSessionExists = await this.liveSessionService.isLiveSessionExists(liveSession.liveSessionId);
        if (isLiveSessionExists) {
          liveSession.state = LiveSessionState.CREATED;
          liveSession.closeWaitAt = null;
          toCreateds.push(liveSession);
        } else {
          // no heartbeat
        }
      }

      if (toCreateds.length > 0) {
        await manager.getRepository(LiveSession).save(toCreateds);
        this.logger.debug('LiveSessionUpdater: closeWaitToCreatedOrClosed', {
          toCreateds,
        });
      }

      const toCloses = closeWaits
        .filter((liveSession) => toCreateds.findIndex((toCreated) => toCreated.liveSessionId === liveSession.liveSessionId) === -1)
        .filter((liveSession) => {
          const allowedTime = new Date().getTime() - config.liveSession.closeWait.allowedMilliseconds;
          if (liveSession.closeWaitAt) {
            // old closeWaitAt
            return liveSession.closeWaitAt.getTime() < allowedTime;
          } else {
            throw new Error('closeWaitAt must not be null');
          }
        });

      if (toCloses.length > 0) {
        return await closeInTransaction(this.logger, this.deviceCommandService, manager, toCloses);
      }
    });
  }
}
