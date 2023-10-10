import { errorify } from '@dogu-tech/common';
import { setInterval } from 'timers/promises';
import { EventProcessor, EventProcessorOptions } from './event.processor';

export type OnEventProduce = () => Promise<string>;

export interface EventProducerOptions extends Omit<EventProcessorOptions, 'type'> {
  /**
   * @unit milliseconds
   */
  produceInterval: number;

  /**
   * @unit milliseconds
   */
  eventExpireTimeout: number;

  onProduce: OnEventProduce;
}

export class EventProducer extends EventProcessor {
  private readonly produceInterval: number;
  private readonly eventExpireTimeout: number;
  private readonly onProduce: OnEventProduce;

  constructor(options: EventProducerOptions) {
    super({ ...options, type: 'producer' });
    this.produceInterval = options.produceInterval;
    this.eventExpireTimeout = options.eventExpireTimeout;
    this.onProduce = options.onProduce;
  }

  start(): void {
    this.processProduce().catch((error) => {
      this.logger.error('produce processing stopped', { error: errorify(error) });
    });
  }

  private async processProduce(): Promise<void> {
    for await (const _ of setInterval(this.produceInterval)) {
      if (this.stopped) {
        return;
      }

      try {
        await this.redis.watch(this.key);
        const count = await this.redis.llen(this.key);
        if (count > 0) {
          continue;
        }

        const value = await this.onProduce();
        const results = await this.redis
          .multi()
          .rpush(this.key, value)
          .expire(this.key, this.eventExpireTimeout / 1000)
          .exec();
        if (results === null) {
          continue;
        }

        for (const [error, _] of results) {
          if (error !== null) {
            this.logger.warn('push failed', { error: errorify(error) });
          }
        }
      } catch (error) {
        this.logger.error('push processing failed', { error: errorify(error) });
      } finally {
        await this.unwatch();
      }
    }
  }
}
