import { errorify, validateAndEmitEventAsync } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { config } from '../config';
import { OnUpdateEvent } from '../events';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class UpdateTriggerService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: DoguLogger,
  ) {}

  @Interval(config.update.intervalMilliseconds)
  async update(): Promise<void> {
    try {
      await validateAndEmitEventAsync(this.eventEmitter, OnUpdateEvent, {});
    } catch (error) {
      this.logger.error('update failed', { error: errorify(error) });
    }
  }
}
