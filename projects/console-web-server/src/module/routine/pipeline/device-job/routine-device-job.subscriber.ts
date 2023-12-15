import { RoutineDeviceJobPropSnake } from '@dogu-private/console';
import { BrowserName, PIPELINE_STATUS, ROUTINE_DEVICE_JOB_TABLE_NAME } from '@dogu-private/types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import EventEmitter from 'events';
import _ from 'lodash';
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
      const routineDeviceJobSnake = message.data;
      const routineDeviceJob: RoutineDeviceJob = {
        routineDeviceJobId: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.routine_device_job_id) as unknown as number,
        routineJobId: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.routine_job_id) as unknown as number,
        deviceId: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.device_id) as unknown as string,
        status: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.status) as unknown as PIPELINE_STATUS,
        record: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.record) as unknown as number,
        appVersion: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.app_version)
          ? (_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.app_version) as unknown as string)
          : null,
        appPackageName: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.app_package_name)
          ? (_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.app_package_name) as unknown as string)
          : null,
        browserName: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.browser_name)
          ? (_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.browser_name) as unknown as BrowserName)
          : null,
        browserVersion: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.browser_version)
          ? (_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.browser_version) as unknown as string)
          : null,
        windowProcessId: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.window_process_id)
          ? (_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.window_process_id) as unknown as number)
          : null,
        heartbeat: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.heartbeat)
          ? new Date(_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.heartbeat) as unknown as string)
          : null,
        deviceRunnerId: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.device_runner_id)
          ? (_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.device_runner_id) as unknown as string)
          : null,
        createdAt: new Date(_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.created_at) as unknown as string),
        updatedAt: new Date(_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.updated_at) as unknown as string),
        deletedAt: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.deleted_at)
          ? new Date(_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.deleted_at) as unknown as string)
          : null,
        inProgressAt: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.in_progress_at)
          ? new Date(_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.in_progress_at) as unknown as string)
          : null,
        completedAt: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.completed_at)
          ? new Date(_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.completed_at) as unknown as string)
          : null,
        localInProgressAt: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.local_in_progress_at)
          ? new Date(_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.local_in_progress_at) as unknown as string)
          : null,
        localCompletedAt: _.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.local_completed_at)
          ? new Date(_.get(routineDeviceJobSnake, RoutineDeviceJobPropSnake.local_completed_at) as unknown as string)
          : null,
      };
      this.emitter.emit('message', {
        ...message,
        data: routineDeviceJob,
      });
    });
  }
}
