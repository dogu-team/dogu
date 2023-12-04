import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { config } from '../../config';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class RedisService extends Redis implements OnModuleInit {
  readonly subscriber: Redis;

  constructor(private readonly logger: DoguLogger) {
    super({
      host: config.redis.options.host,
      port: config.redis.options.port,
      password: config.redis.options.password,
      db: config.redis.options.db,
      lazyConnect: true,
    });
    this.subscriber = this.duplicate();
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.quit();
  }

  async createSubscriber(channel: string, onMessage: (message: string) => void): Promise<Redis> {
    const subscriber = this.duplicate();
    subscriber.on('message', (receivedChannel: string, message: string) => {
      this.logger.debug('RedisService.onMessage', { channel, receivedChannel, message });
      if (channel === receivedChannel) {
        onMessage(message);
      }
    });

    await subscriber.subscribe(channel, (error, count) => {
      this.logger.debug('RedisService.subscribeMessage.subscribe', { channel, error, count });
    });

    return subscriber;
  }
}
