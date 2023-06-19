import { DuplicatedCallGuarder, errorify } from '@dogu-tech/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import Redis from 'ioredis';
import { config } from '../../config';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class UpdateProducer {
  private readonly duplicatedCallGuarder = new DuplicatedCallGuarder();

  constructor(@InjectRedis() private readonly redis: Redis, private readonly logger: DoguLogger) {}

  @Interval(config.event.updateConnection.push.intervalMilliseconds)
  async onUpdate(): Promise<void> {
    try {
      await this.duplicatedCallGuarder.guard(() => this.onUpdateInternal());
    } catch (error) {
      this.logger.error('producer update failed', { error: errorify(error) });
    }
  }

  private onUpdateInternal(): void {
    this.pushIfEmpty(config.redis.key.updateConnection).catch((error) => {
      this.logger.error(error);
    });
  }

  async pushIfEmpty(key: string, value = '0'): Promise<void> {
    const count = await this.redis.llen(key);
    if (count > 0) {
      return;
    }
    await this.redis.rpush(key, value);
    await this.redis.expire(key, config.redis.expireSeconds);
  }
}
