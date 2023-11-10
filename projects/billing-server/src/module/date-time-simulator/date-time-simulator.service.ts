import { transformAndValidateSync } from '@dogu-tech/common';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { DataSource } from 'typeorm';
import { DateTimeSimulator, DateTimeSimulatorProp, DateTimeSimulatorTableName } from '../../db/entity/date-time-simulator.entity';
import { getClient } from '../../db/utils';
import { DoguLogger } from '../logger/logger';

const EventChannelName = 'date_time_simulator_change_event';

@Injectable()
export class DateTimeSimulatorService implements OnModuleInit {
  private dateTimeSimulator = new DateTimeSimulator();

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    const client = await getClient(this.dataSource);
    await client.query(`
CREATE OR REPLACE FUNCTION notify_date_time_simulator_change() RETURNS TRIGGER AS $$
DECLARE
  payload TEXT;

BEGIN
  payload := json_build_object(
    '${DateTimeSimulatorProp.dateTimeSimulatorId}', NEW."${DateTimeSimulatorProp.dateTimeSimulatorId}",
    '${DateTimeSimulatorProp.yearsOffset}', NEW."${DateTimeSimulatorProp.yearsOffset}",
    '${DateTimeSimulatorProp.monthsOffset}', NEW."${DateTimeSimulatorProp.monthsOffset}",
    '${DateTimeSimulatorProp.daysOffset}', NEW."${DateTimeSimulatorProp.daysOffset}",
    '${DateTimeSimulatorProp.hoursOffset}', NEW."${DateTimeSimulatorProp.hoursOffset}",
    '${DateTimeSimulatorProp.minutesOffset}', NEW."${DateTimeSimulatorProp.minutesOffset}",
    '${DateTimeSimulatorProp.secondsOffset}', NEW."${DateTimeSimulatorProp.secondsOffset}",
    '${DateTimeSimulatorProp.millisecondsOffset}', NEW."${DateTimeSimulatorProp.millisecondsOffset}"
  )::text;
  PERFORM pg_notify('${EventChannelName}', payload);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER date_time_simulator_after_insert
AFTER INSERT ON "${DateTimeSimulatorTableName}"
FOR EACH ROW EXECUTE FUNCTION notify_date_time_simulator_change();

CREATE OR REPLACE TRIGGER date_time_simulator_after_update
AFTER UPDATE ON "${DateTimeSimulatorTableName}"
FOR EACH ROW EXECUTE FUNCTION notify_date_time_simulator_change();

LISTEN ${EventChannelName};
    `);

    client.on('notification', (message) => {
      if (message.channel !== EventChannelName) {
        return;
      }

      if (!message.payload) {
        return;
      }

      try {
        const parsed = transformAndValidateSync(DateTimeSimulator, JSON.parse(message.payload));
        this.update(parsed);
      } catch (error) {
        this.logger.error(`Failed to parse payload: ${message.payload}`);
      }
    });

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

  private update(dateTimeSimulator: DateTimeSimulator): void {
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
