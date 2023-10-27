import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { config } from '../../config';

@Injectable()
export class RedisService extends Redis implements OnModuleInit {
  readonly subscriber: Redis;

  constructor() {
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

  async subscribeMessage(channel: string, onMessage: (message: string) => void): Promise<() => Promise<void>> {
    const onMessageImpl = (receivedChannel: string, message: string) => {
      if (channel === receivedChannel) {
        onMessage(message);
      }
    };
    this.subscriber.on('message', onMessageImpl);
    await this.subscriber.subscribe(channel);
    const unsubscribe = async () => {
      await this.subscriber.unsubscribe(channel);
      this.subscriber.removeListener('message', onMessageImpl);
    };
    return unsubscribe;
  }
}
