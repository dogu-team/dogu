import { DevicePropCamel, RemoteDeviceJobPropCamel, RemoteDeviceJobPropSnake, RoutineDeviceJobPropSnake } from '@dogu-private/console';
import { DEVICE_TABLE_NAME, PIPELINE_STATUS, REMOTE_DEVICE_JOB_SESSION_STATE } from '@dogu-private/types';
import { DeviceWebDriver } from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import _ from 'lodash';
import { DataSource } from 'typeorm';
import { RoutineDeviceJob } from '../../../db/entity/index';
import { RemoteDeviceJob } from '../../../db/entity/remote-device-job.entity';
import { DeviceMessageRelayer } from '../../device-message/device-message.relayer';
import { DoguLogger } from '../../logger/logger';
import { RemoteDeviceJobProcessor } from '../../remote/processor/remote-device-job-processor';

@Injectable()
export class RemoteDeviceJobUpdater {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource, //
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    this.checkWaitingRemoteDeviceJobs();
    this.checkTimeoutDeviceJobs();
  }

  private async checkWaitingRemoteDeviceJobs(): Promise<void> {
    const waitingRemoteDeviceJobs = await this.dataSource
      .getRepository(RemoteDeviceJob) //
      .createQueryBuilder('remoteDeviceJob')
      .innerJoinAndSelect(`remoteDeviceJob.${RemoteDeviceJobPropCamel.device}`, 'device')
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
      .where({ sessionState: REMOTE_DEVICE_JOB_SESSION_STATE.WAITING })
      .getMany();

    if (waitingRemoteDeviceJobs.length === 0) {
      return;
    }

    // group by deviceId
    const highestPriorityDeviceJobs: RemoteDeviceJob[] = [];
    const deviceJobGroups = _.groupBy(waitingRemoteDeviceJobs, (deviceJob) => deviceJob.deviceId);
    const deviceIds = Object.keys(deviceJobGroups);

    this.logger.info(`checkWaitingRemoteDeviceJobs. check waiting remote-device-jobs. deviceIds: ${deviceIds}`);

    for (const deviceId of deviceIds) {
      const waitingRemoteDeviceJobsByDeviceId = deviceJobGroups[deviceId];
      const waitingRoutineDeviceJobsByDeviceId = await this.dataSource.getRepository(RoutineDeviceJob).find({
        where: {
          deviceId,
          status: PIPELINE_STATUS.WAITING,
        },
      });

      const maxParallel = waitingRemoteDeviceJobsByDeviceId[0]?.device!.maxParallelJobs!;
      if (maxParallel === 1) {
        const deviceJob = waitingRemoteDeviceJobsByDeviceId.find((deviceJob) => deviceJob.deviceId === deviceId);
        const inProgressDeviceJobs = deviceJob!.device?.routineDeviceJobs ?? [];
        const inProgressRemoteDeviceJobs = deviceJob!.device?.remoteDeviceJobs ?? [];
        const totalInProgressDeviceJobs = inProgressDeviceJobs.length + inProgressRemoteDeviceJobs.length;
        if (totalInProgressDeviceJobs === 0) highestPriorityDeviceJobs.push(deviceJob!);
      } else {
        const inProgressDeviceJobs = waitingRemoteDeviceJobsByDeviceId[0]?.device?.routineDeviceJobs?.length ?? 0;
        const inProgressRemoteDeviceJobs = waitingRemoteDeviceJobsByDeviceId[0]?.device?.remoteDeviceJobs?.length ?? 0;
        const addableDeviceJobCount = maxParallel - inProgressDeviceJobs - inProgressRemoteDeviceJobs;
        if (addableDeviceJobCount <= 0) {
          continue;
        }

        const allWaingDeviceJobs = [...waitingRoutineDeviceJobsByDeviceId, ...waitingRemoteDeviceJobsByDeviceId];
        // sort by createdAt
        const sortedDeviceJobs = allWaingDeviceJobs.sort((a, b) => {
          return a.createdAt.getTime() - b.createdAt.getTime();
        });

        let pushCount = 0;
        for (const deviceJob of sortedDeviceJobs) {
          if (deviceJob instanceof RoutineDeviceJob) {
            break;
          }

          if (pushCount >= addableDeviceJobCount) {
            break;
          }

          highestPriorityDeviceJobs.push(deviceJob);
          pushCount++;
        }
      }
    }

    for (const remoteDeviceJob of highestPriorityDeviceJobs) {
      await RemoteDeviceJobProcessor.setRemoteDeviceJobSessionState(this.dataSource.manager, remoteDeviceJob, REMOTE_DEVICE_JOB_SESSION_STATE.IN_PROGRESS);
    }
  }

  private async checkTimeoutDeviceJobs(): Promise<void> {
    const inprogressRemoteDeviceJobs = await this.dataSource.getRepository(RemoteDeviceJob).find({
      where: { sessionState: REMOTE_DEVICE_JOB_SESSION_STATE.IN_PROGRESS },
      relations: [DEVICE_TABLE_NAME],
    });

    if (inprogressRemoteDeviceJobs.length === 0) {
      return;
    }

    this.logger.info(`checkTimeoutDeviceJobs. check timeout remote-device-jobs. id: [${inprogressRemoteDeviceJobs.map((remoteDeviceJob) => remoteDeviceJob.remoteDeviceJobId)}]`);

    const timeoutRemoteDeviceJobs = inprogressRemoteDeviceJobs.filter((remoteDeviceJob) => {
      const intervalTimeoutms = remoteDeviceJob.intervalTimeout;
      const lastIntervalTime = remoteDeviceJob.lastIntervalTime;
      const now = Date.now();

      const isTimeout = now - lastIntervalTime.getTime() > intervalTimeoutms;
      return isTimeout;
    });

    if (timeoutRemoteDeviceJobs.length === 0) {
      return;
    }
    for (const timeoutDeviceJob of timeoutRemoteDeviceJobs) {
      const device = timeoutDeviceJob.device!;
      const sessionId = timeoutDeviceJob.sessionId;
      const pathProvider = new DeviceWebDriver.sessionDeleted.pathProvider(device.serial);
      const path = DeviceWebDriver.sessionDeleted.resolvePath(pathProvider);
      const res = this.deviceMessageRelayer
        .sendHttpRequest(
          device.organizationId,
          device.deviceId,
          DeviceWebDriver.sessionDeleted.method,
          path,
          undefined,
          undefined,
          { sessionId },
          DeviceWebDriver.sessionDeleted.responseBody,
        )
        .catch((error) => {
          this.logger.error(`checkTimeoutDeviceJobs sendHttpRequest error`, { error });
        });
      this.logger.warn(`checkTimeoutDeviceJobs. remote-device-job is timeout. id: ${timeoutDeviceJob.remoteDeviceJobId}`);
      await RemoteDeviceJobProcessor.setRemoteDeviceJobSessionState(this.dataSource.manager, timeoutDeviceJob, REMOTE_DEVICE_JOB_SESSION_STATE.FAILURE);
    }
  }
}
