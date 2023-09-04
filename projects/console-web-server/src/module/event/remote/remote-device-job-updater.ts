import { DevicePropCamel, RemoteDeviceJobPropCamel, RemoteDeviceJobPropSnake, RoutineDeviceJobPropSnake } from '@dogu-private/console';
import { DEVICE_TABLE_NAME, PIPELINE_STATUS, REMOTE_DEVICE_JOB_SESSION_STATE } from '@dogu-private/types';
import { DefaultHttpOptions, DoguRequestTimeoutHeader, HeaderRecord, stringify } from '@dogu-tech/common';
import { DeviceWebDriver } from '@dogu-tech/device-client-common';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import _ from 'lodash';
import { DataSource } from 'typeorm';
import { DeviceRunner } from '../../../db/entity/device-runner.entity';
import { RemoteDeviceJob } from '../../../db/entity/remote-device-job.entity';
import { SlackMessageService } from '../../../enterprise/module/integration/slack/slack-message.service';
import { DeviceMessageRelayer } from '../../device-message/device-message.relayer';
import { DoguLogger } from '../../logger/logger';
import { RemoteDeviceJobProcessor } from '../../remote/processor/remote-device-job-processor';

@Injectable()
export class RemoteDeviceJobUpdater {
  constructor(
    @Inject(SlackMessageService)
    private readonly slackMessageService: SlackMessageService,

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

    const deviceJobGroups = _.groupBy(waitingRemoteDeviceJobs, (deviceJob) => deviceJob.deviceId);
    const deviceIds = Object.keys(deviceJobGroups);

    this.logger.info(`checkWaitingRemoteDeviceJobs. check waiting remote-device-jobs. deviceIds: ${stringify(deviceIds)}`);

    for (const deviceId of deviceIds) {
      const waitingRemoteDeviceJobsByDeviceId = deviceJobGroups[deviceId];
      const sortedWaitingRemoteDeviceJobsByDeviceId = waitingRemoteDeviceJobsByDeviceId.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const deviceRunners = await this.dataSource.getRepository(DeviceRunner).find({ where: { deviceId, isInUse: 0 } });
      const promises = _.zip(deviceRunners, sortedWaitingRemoteDeviceJobsByDeviceId).map(async ([deviceRunner, remoteDeviceJob]) => {
        if (!deviceRunner || !remoteDeviceJob) {
          return;
        }

        await this.dataSource.manager.transaction(async (manager) => {
          await manager.getRepository(DeviceRunner).update(deviceRunner.deviceRunnerId, { isInUse: 1 });
          remoteDeviceJob.deviceRunnerId = deviceRunner.deviceRunnerId;
          await RemoteDeviceJobProcessor.setRemoteDeviceJobSessionState(manager, remoteDeviceJob, REMOTE_DEVICE_JOB_SESSION_STATE.IN_PROGRESS, this.slackMessageService);
        });
      });

      await Promise.allSettled(promises);
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
      const headers: HeaderRecord = {};
      headers[DoguRequestTimeoutHeader] = DefaultHttpOptions.request.timeout1minutes.toString();
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
      await RemoteDeviceJobProcessor.setRemoteDeviceJobSessionState(this.dataSource.manager, timeoutDeviceJob, REMOTE_DEVICE_JOB_SESSION_STATE.FAILURE, this.slackMessageService);
    }
  }
}
