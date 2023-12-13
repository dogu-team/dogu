import { ROUTINE_DEVICE_JOB_TABLE_NAME } from '@dogu-private/types';
import { transform } from '@dogu-tech/common';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import EventEmitter from 'events';
import { DataSource } from 'typeorm';
import { RoutineDeviceJob } from '../../../../db/entity/device-job.entity';
import { Message, subscribe } from '../../../../db/utils';
import { DoguLogger } from '../../../logger/logger';

export type RoutineDeviceJobEventEmitter = EventEmitter & {
  on(event: 'message', listener: (message: Message<RoutineDeviceJob>) => void): void;
};

@Injectable()
export class RoutineDeviceJobSubscriber implements OnModuleInit {
  readonly emitter: RoutineDeviceJobEventEmitter = new EventEmitter();

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    await subscribe(this.logger, this.dataSource, ROUTINE_DEVICE_JOB_TABLE_NAME, (message) => {
      const routineDeviceJob = transform(RoutineDeviceJob, message.data, {}, this.logger);
      this.emitter.emit('message', {
        ...message,
        data: routineDeviceJob,
      });
    });
  }
}
