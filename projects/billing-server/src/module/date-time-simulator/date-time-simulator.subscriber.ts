import { stringify, transformAndValidateSync } from '@dogu-tech/common';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DateTimeSimulator, DateTimeSimulatorTableName } from '../../db/entity/date-time-simulator.entity';
import { subscribe } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';
import { DateTimeSimulatorService } from './date-time-simulator.service';

@Injectable()
export class DateTimeSimulatorSubscriber implements OnModuleInit {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly dateTimeSimulatorService: DateTimeSimulatorService,
  ) {}

  async onModuleInit(): Promise<void> {
    await subscribe(this.logger, this.dataSource, DateTimeSimulatorTableName, (message) => {
      this.logger.info('DateTimeSimulatorSubscriber.subscribe', { message: stringify(message) });
      if (message.event === 'created' || message.event === 'updated') {
        const parsed = transformAndValidateSync(DateTimeSimulator, message.data);
        this.dateTimeSimulatorService.update(parsed);
      }
    });
  }
}
