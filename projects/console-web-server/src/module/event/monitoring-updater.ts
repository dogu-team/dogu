import { errorify } from '@dogu-tech/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { WebClient } from '@slack/web-api';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';
import { config } from '../../config';
import { LiveSession } from '../../db/entity/live-session.entity';
import { env } from '../../env';
import { FEATURE_CONFIG } from '../../feature.config';
import { LiveSessionService } from '../live-session/live-session.service';
import { DoguLogger } from '../logger/logger';
import { EventConsumer } from './event.consumer';
import { EventProducer } from './event.producer';

const slackChannelId = 'C02T444L6LB';

@Injectable()
export class MonitoringUpdater implements OnModuleInit, OnModuleDestroy {
  private readonly eventProducer: EventProducer;
  private readonly eventConsumer: EventConsumer;
  private readonly slackClient: WebClient | null = null;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRedis()
    private readonly redis: Redis,
    private readonly logger: DoguLogger,
    private readonly liveSessionService: LiveSessionService,
  ) {
    this.eventProducer = new EventProducer({
      redis,
      logger,
      key: config.redis.key.updateMonitoring,
      produceInterval: 1000,
      eventExpireTimeout: 60 * 1000,
      onProduce: async () => {
        return '0';
      },
    });
    this.eventConsumer = new EventConsumer({
      redis,
      logger,
      key: config.redis.key.updateMonitoring,
      consumeInterval: 1000,
      onConsume: () => this.update(),
    });

    if (env.DOGU_SLACK_BOT_TOKEN) {
      this.slackClient = new WebClient(env.DOGU_SLACK_BOT_TOKEN);
    }
  }

  onModuleInit() {
    if (!FEATURE_CONFIG.get('slackNotification')) {
      return;
    }

    this.eventProducer.start();
    this.eventConsumer.start();
  }

  onModuleDestroy() {
    if (!FEATURE_CONFIG.get('slackNotification')) {
      return;
    }

    this.eventProducer.stop();
    this.eventConsumer.stop();
  }

  private async update(): Promise<void> {
    await this.notifyLiveSessionCount();
  }

  private async notifyLiveSessionCount(): Promise<void> {
    if (!this.slackClient) {
      return;
    }

    const previousCount = await this.liveSessionService.getLiveSessionCount();
    const currentCount = await this.dataSource.manager.getRepository(LiveSession).count();
    await this.liveSessionService.setLiveSessionCount(currentCount);
    if (previousCount === 0) {
      return;
    }

    if (previousCount === currentCount) {
      return;
    }

    try {
      const diffCount = currentCount - previousCount;
      await this.slackClient.chat.postMessage({
        channel: slackChannelId,
        username: 'Live Session Count Notifier',
        text: `🤑 라이브 세션이 ${diffCount}개 추가되었어요! (이전: ${previousCount}, 현재: ${currentCount})`,
      });
    } catch (error) {
      this.logger.error('Failed to notify live session count', { error: errorify(error) });
    }
  }
}
