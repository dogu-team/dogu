import { transformAndValidateSync } from '@dogu-tech/common';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { DataSource } from 'typeorm';
import { DateTimeSimulator, DateTimeSimulatorProp, DateTimeSimulatorTableName } from '../../db/entity/date-time-simulator.entity';
import { getClient } from '../../db/retry-transaction';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class DateTimeSimulatorService implements OnModuleInit {
  private dateTimeSimulator = new DateTimeSimulator();

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    const repo = this.dataSource.getRepository(DateTimeSimulator);
    const found = await repo.findOne({
      where: {},
    });

    if (found) {
      this.update(found);
    } else {
      const created = repo.create({});
      await repo.save(created);
    }
  }

  update(dateTimeSimulator: DateTimeSimulator): void {
    this.dateTimeSimulator = dateTimeSimulator;
    this.logger.warn('DateTimeSimulator updated', { dateTimeSimulator, now: this.now() });
  }

  apply(date: Date): Date {
    const { yearsOffset, monthsOffset, daysOffset, hoursOffset, minutesOffset, secondsOffset, millisecondsOffset } = this.dateTimeSimulator;
    return DateTime.fromJSDate(date)
      .plus({
        years: yearsOffset,
        months: monthsOffset,
        days: daysOffset,
        hours: hoursOffset,
        minutes: minutesOffset,
        seconds: secondsOffset,
        milliseconds: millisecondsOffset,
      })
      .toJSDate();
  }

  now(): Date {
    return this.apply(new Date());
  }
}
