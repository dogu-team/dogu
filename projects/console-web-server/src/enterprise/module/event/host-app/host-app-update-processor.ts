import { time } from '@dogu-tech/common';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { config } from '../../../../config';
import { EventConsumer } from '../../../../module/event/event.consumer';
import { EventProducer } from '../../../../module/event/event.producer';
import { DoguLogger } from '../../../../module/logger/logger';
import { RedisService } from '../../../../module/redis/redis.service';
import { HostAppService } from '../../host-app/host-app.service';

@Injectable()
export class HostAppUpdateProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly eventProducer: EventProducer;
  private readonly eventConsumer: EventConsumer;

  constructor(
    private readonly redis: RedisService,
    private readonly hostApp: HostAppService,
    private readonly logger: DoguLogger,
  ) {
    this.eventProducer = new EventProducer({
      redis,
      logger,
      key: config.redis.key.updateHostApp,
      produceInterval: time({ minutes: 5 }),
      eventExpireTimeout: 60 * 1000,
      onProduce: async (): Promise<string> => {
        return Promise.resolve('0');
      },
    });
    this.eventConsumer = new EventConsumer({
      redis,
      logger,
      key: config.redis.key.updateHostApp,
      consumeInterval: time({ minutes: 1 }),
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
    await this.hostApp.updateAllIdleHost();
  }
}
