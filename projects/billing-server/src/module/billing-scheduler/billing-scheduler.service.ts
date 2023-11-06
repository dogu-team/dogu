import { errorify } from '@dogu-tech/common';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { setInterval } from 'timers/promises';
import { DataSource } from 'typeorm';
import { retrySerialize } from '../../db/utils';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class BillingSchedulerService implements OnModuleInit, OnModuleDestroy {
  private closed = false;

  constructor(
    private readonly logger: DoguLogger,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit(): void {
    this.run()
      .then(() => {
        this.logger.info('BillingSchedulerService.run finished');
      })
      .catch((error) => {
        this.logger.error('BillingSchedulerService.run error', { error: errorify(error) });
      });
  }

  onModuleDestroy(): void {
    this.closed = true;
  }

  async run(): Promise<void> {
    for await (const _ of setInterval(24 * 60 * 60 * 1000)) {
      if (this.closed) {
        return;
      }

      try {
        await retrySerialize(this.logger, this.dataSource, async (context) => {
          const { manager } = context;
          await Promise.resolve();
        });
      } catch (error) {
        this.logger.error('BillingSchedulerService.run.interval error', { error: errorify(error) });
      }
    }
  }
}
