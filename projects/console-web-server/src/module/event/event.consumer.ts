import { errorify } from '@dogu-tech/common';
import { setInterval } from 'timers/promises';
import { EventProcessor, EventProcessorOptions } from './event.processor';

export type OnEventConsume = (event: string) => Promise<void>;

export interface EventConsumerOptions extends Omit<EventProcessorOptions, 'type'> {
  /**
   * @unit milliseconds
   */
  consumeInterval: number;

  onConsume: OnEventConsume;
}

export class EventConsumer extends EventProcessor {
  private readonly consumeInterval: number;
  private readonly onConsume: OnEventConsume;

  constructor(options: EventConsumerOptions) {
    super({ ...options, type: 'consumer' });
    this.consumeInterval = options.consumeInterval;
    this.onConsume = options.onConsume;
  }

  start(): void {
    this.processConsume().catch((error) => {
      this.logger.error('consume processing stopped', { error: errorify(error) });
    });
  }

  private async processConsume(): Promise<void> {
    for await (const _ of setInterval(this.consumeInterval)) {
      if (this.stopped) {
        return;
      }

      try {
        await this.redis.watch(this.key);
        const count = await this.redis.llen(this.key);
        if (count === 0) {
          continue;
        }

        const results = await this.redis //
          .multi()
          .lpop(this.key, 1)
          .exec();
        if (results === null) {
          continue;
        }

        if (results.length !== 1) {
          this.logger.warn('unexpected consume result', { results });
          continue;
        }

        const [error, result] = results[0];
        if (error !== null) {
          this.logger.warn('consume failed', { error: errorify(error) });
          continue;
        }

        if (!Array.isArray(result)) {
          this.logger.warn('unexpected consume result type', { result });
          continue;
        }

        if (result.length !== 1) {
          this.logger.warn('unexpected consume result length', { result });
          continue;
        }

        const [item] = result;
        if (typeof item !== 'string') {
          this.logger.warn('unexpected consume result item type', { item });
          continue;
        }

        await this.onConsume(item);
      } catch (error) {
        this.logger.error('pop processing failed', { error: errorify(error) });
      } finally {
        await this.unwatch();
      }
    }
  }
}
