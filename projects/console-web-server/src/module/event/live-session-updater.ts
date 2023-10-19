import { LiveSessionState } from '@dogu-private/types';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';

import { config } from '../../config';
import { LiveSession } from '../../db/entity/live-session.entity';
import { LiveSessionService } from '../live-session/live-session.service';
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
    private readonly liveSessionService: LiveSessionService,
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
        return await this.liveSessionService.closeInTransaction(manager, toCloses);
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
