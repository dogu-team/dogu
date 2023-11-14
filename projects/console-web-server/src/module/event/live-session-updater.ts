import { DeviceConnectionState, LiveSessionActiveStates, LiveSessionState } from '@dogu-private/types';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Not } from 'typeorm';

import { config } from '../../config';
import { LiveSession } from '../../db/entity/live-session.entity';
import { LiveSessionService } from '../live-session/live-session.service';
import { DoguLogger } from '../logger/logger';
import { DeviceCommandService } from '../organization/device/device-command.service';
import { RedisService } from '../redis/redis.service';
import { EventConsumer } from './event.consumer';
import { EventProducer } from './event.producer';

@Injectable()
export class LiveSessionUpdater implements OnModuleInit, OnModuleDestroy {
  private readonly eventProducer: EventProducer;
  private readonly eventConsumer: EventConsumer;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly redis: RedisService,
    private readonly logger: DoguLogger,
    private readonly liveSessionService: LiveSessionService,
    private readonly deviceCommandService: DeviceCommandService,
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
    await this.startUpdateCloudLicenseLiveTesting();
    await this.toClosedIfDeviceDisconnected();
    await this.createdToCloseWait();
    await this.closeWaitToCreatedOrClosed();
  }

  private async startUpdateCloudLicenseLiveTesting(): Promise<void> {
    const liveSessions = await this.dataSource.manager
      .getRepository(LiveSession)
      .createQueryBuilder()
      .where({
        state: In(LiveSessionActiveStates),
      })
      .getMany();
    for (const liveSession of liveSessions) {
      const cloudLicenseId = await this.liveSessionService.findCloudLicenseId(liveSession.liveSessionId);
      if (!cloudLicenseId) {
        continue;
      }

      const isCloudLicenseLiveTestingHeartbeatExists = await this.liveSessionService.isCloudLicenseLiveTestingHeartbeatExists(cloudLicenseId);
      if (isCloudLicenseLiveTestingHeartbeatExists) {
        continue;
      }

      await this.liveSessionService.startUpdateCloudLicenseLiveTesting(cloudLicenseId, liveSession.liveSessionId);
    }
  }

  private async toClosedIfDeviceDisconnected(): Promise<void> {
    const closedSessions = await this.dataSource.manager.transaction(async (manager) => {
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

      const toCloseds = disconnecteds.map((liveSession) => LiveSessionService.updateLiveSessionToClosed(liveSession));
      const closeds = await manager.getRepository(LiveSession).save(toCloseds);
      return closeds;
    });

    if (closedSessions.length > 0) {
      await Promise.all(
        closedSessions.map(async (liveSession) => {
          await this.liveSessionService.publishCloseEvent(liveSession.liveSessionId, 'closed!');
        }),
      );
    }
  }

  private async createdToCloseWait(): Promise<void> {
    const closeWaitSessions = await this.dataSource.manager.transaction(async (manager) => {
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
        const rv = await manager.save(newCloseWaits);
        this.logger.debug('LiveSessionUpdater: createdToCloseWait', {
          newCloseWaits,
        });
        return rv;
      }
    });

    if (!!closeWaitSessions && closeWaitSessions.length > 0) {
      await Promise.all(
        closeWaitSessions.map(async (liveSession) => {
          await this.liveSessionService.publishCloseWaitEvent(liveSession.liveSessionId, `closeWait!`);
        }),
      );
    }
  }

  private async closeWaitToCreatedOrClosed(): Promise<void> {
    const closedSessions = await this.dataSource.manager.transaction(async (manager) => {
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
        return await LiveSessionService.closeInTransaction(this.logger, this.deviceCommandService, manager, toCloses);
      }
    });

    if (!!closedSessions && closedSessions.length > 0) {
      await Promise.all(
        closedSessions.map(async (liveSession) => {
          await this.liveSessionService.publishCloseEvent(liveSession.liveSessionId, 'closed!');
        }),
      );
    }
  }
}
