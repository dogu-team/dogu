import { errorify, PrefixLogger } from '@dogu-tech/common';
import Redis from 'ioredis';
import { DoguLogger } from '../logger/logger';

export interface EventProcessorOptions {
  redis: Redis;
  logger: DoguLogger;
  key: string;
  type: EventProcessorType;
}

export type EventProcessorType = 'producer' | 'consumer';

export class EventProcessor {
  protected readonly redis: Redis;
  protected readonly logger: PrefixLogger;
  protected readonly key: string;
  protected readonly type: EventProcessorType;
  protected stopped = false;

  constructor(options: EventProcessorOptions) {
    this.redis = options.redis;
    this.logger = new PrefixLogger(options.logger, `[event ${options.type} ${options.key}]`);
    this.key = options.key;
    this.type = options.type;
  }

  stop(): void {
    this.stopped = true;
  }

  protected async unwatch(): Promise<void> {
    try {
      await this.redis.unwatch();
    } catch (error) {
      this.logger.error('unwatch failed', { error: errorify(error) });
    }
  }
}
