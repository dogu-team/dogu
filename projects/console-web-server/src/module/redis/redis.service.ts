import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { config } from '../../config';

@Injectable()
export class RedisService extends Redis implements OnModuleInit {
  constructor() {
    super({
      host: config.redis.options.host,
      port: config.redis.options.port,
      password: config.redis.options.password,
      db: config.redis.options.db,
      lazyConnect: true,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.quit();
  }
}
