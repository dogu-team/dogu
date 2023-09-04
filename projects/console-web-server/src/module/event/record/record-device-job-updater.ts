import {
  DevicePropCamel,
  RecordCaseActionPropCamel,
  RecordDeviceJobPropCamel,
  RecordDeviceJobPropSnake,
  RemoteDeviceJobPropSnake,
  RoutineDeviceJobPropSnake,
} from '@dogu-private/console';
import { PIPELINE_STATUS, RECORD_PIPELINE_STATE, REMOTE_DEVICE_JOB_SESSION_STATE } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import _ from 'lodash';
import { DataSource } from 'typeorm';
import { DeviceRunner } from '../../../db/entity/device-runner.entity';
import { RecordDeviceJob } from '../../../db/entity/record-device-job.entity';
import { RecordDeviceJobProcessor } from '../../../enterprise/module/record/processor/record-device-job-processor';
import { DoguLogger } from '../../logger/logger';
import { ApplicationService } from '../../project/application/application.service';
import { RemoteWebDriverService } from '../../remote/remote-webdriver/remote-webdriver.service';

@Injectable()
export class RecordDeviceJobUpdater {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource, //
    private readonly logger: DoguLogger,
    @Inject(RemoteWebDriverService)
    private readonly remoteWebDriverService: RemoteWebDriverService,
    @Inject(ApplicationService)
    private readonly applicationService: ApplicationService,
  ) {}

  public async update(): Promise<void> {
    const functionsToCheck = [
      this.checkWaitingRecordDeviceJobs.bind(this), //
      this.checkJobsInProgress.bind(this),
    ];

    for (const checkFunction of functionsToCheck) {
      try {
        await checkFunction.call(this);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async checkWaitingRecordDeviceJobs(): Promise<void> {
    const waitingRecordDeviceJobs = await this.dataSource
      .getRepository(RecordDeviceJob) //
      .createQueryBuilder('recordDeviceJob')
      .innerJoinAndSelect(`recordDeviceJob.${RecordDeviceJobPropCamel.device}`, 'device')
      .innerJoinAndSelect(`recordDeviceJob.${RecordDeviceJobPropCamel.recordCaseActions}`, 'recordCaseAction')
      .innerJoinAndSelect(`recordCaseAction.${RecordCaseActionPropCamel.recordTestCase}`, 'recordTestCase')
      .innerJoinAndSelect(`recordCaseAction.${RecordCaseActionPropCamel.recordStepActions}`, 'recordStepAction')

      .leftJoinAndSelect(
        `device.${DevicePropCamel.recordDeviceJobs}`, //
        'recordDeviceJobs',
        `recordDeviceJobs.${RecordDeviceJobPropSnake.state} =:recordDeviceJobsState`,
        { recordDeviceJobsState: RECORD_PIPELINE_STATE.IN_PROGRESS },
      )
      .leftJoinAndSelect(
        `device.${DevicePropCamel.routineDeviceJobs}`, //
        'routineDeviceJobs',
        `routineDeviceJobs.${RoutineDeviceJobPropSnake.status} =:routineDeviceJobsStatus`,
        { routineDeviceJobsStatus: PIPELINE_STATUS.IN_PROGRESS },
      )
      .leftJoinAndSelect(
        `device.${DevicePropCamel.remoteDeviceJobs}`, //
        'remoteDeviceJobs',
        `remoteDeviceJobs.${RemoteDeviceJobPropSnake.session_state} =:remoteDeviceJobsSessionState`,
        { remoteDeviceJobsSessionState: REMOTE_DEVICE_JOB_SESSION_STATE.IN_PROGRESS },
      )
      .where({ state: RECORD_PIPELINE_STATE.WAITING })
      .getMany();

    if (waitingRecordDeviceJobs.length === 0) {
      return;
    }

    const deviceJobGroups = _.groupBy(waitingRecordDeviceJobs, (deviceJob) => deviceJob.deviceId);
    const deviceIds = Object.keys(deviceJobGroups);

    this.logger.info(`checkWaitingRemoteDeviceJobs. check waiting record-device-jobs. deviceIds: ${stringify(deviceIds)}`);

    // record-device-job
    for (const deviceId of deviceIds) {
      const waitingRecordDeviceJobsByDeviceId = deviceJobGroups[deviceId];
      const sortedWaitingRecordDeviceJobsByDeviceId = waitingRecordDeviceJobsByDeviceId.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const deviceRunners = await this.dataSource.getRepository(DeviceRunner).find({ where: { deviceId, isInUse: 0 } });
      const promises = _.zip(deviceRunners, sortedWaitingRecordDeviceJobsByDeviceId).map(async ([deviceRunner, recordDeviceJob]) => {
        if (!deviceRunner || !recordDeviceJob) {
          return;
        }

        await this.dataSource.manager.transaction(async (manager) => {
          await manager.getRepository(DeviceRunner).update(deviceRunner.deviceRunnerId, { isInUse: 1 });
          recordDeviceJob.deviceRunnerId = deviceRunner.deviceRunnerId;
          await RecordDeviceJobProcessor.setState(manager, recordDeviceJob, RECORD_PIPELINE_STATE.IN_PROGRESS, new Date());

          RecordDeviceJobProcessor.initApp(this.dataSource.manager, recordDeviceJob, this.applicationService, this.remoteWebDriverService);
        });
      });
      await Promise.allSettled(promises);
    }
  }

  private async checkJobsInProgress(): Promise<void> {
    const inProgressJobs = await this.dataSource
      .getRepository(RecordDeviceJob) //
      .createQueryBuilder('recordDeviceJob')
      .innerJoinAndSelect(`recordDeviceJob.${RecordDeviceJobPropCamel.recordCaseActions}`, 'recordCaseAction')
      .innerJoinAndSelect(`recordDeviceJob.${RecordDeviceJobPropCamel.recordPipeline}`, 'pipeline')
      .where(`recordDeviceJob.${RecordDeviceJobPropSnake.state} = :${RecordDeviceJobPropSnake.state}`, { state: RECORD_PIPELINE_STATE.IN_PROGRESS })
      .getMany();

    if (inProgressJobs.length === 0) {
      return;
    }

    for (const recordDeviceJob of inProgressJobs) {
      const nextState = RecordDeviceJobProcessor.getNextStateFromInProgress(recordDeviceJob);
      if (nextState === null) {
        continue;
      }
      await this.dataSource.manager.transaction(async (manager) => {
        await RecordDeviceJobProcessor.complete(manager, nextState, recordDeviceJob, new Date());
      });
    }
  }
}
