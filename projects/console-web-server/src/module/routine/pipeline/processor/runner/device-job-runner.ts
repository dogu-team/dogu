import { StepStatusInfo, UpdateDeviceJobStatusRequestBody } from '@dogu-private/console-host-agent';
import { DEST_STATE, DeviceId, DeviceRunnerId, isCompleted, isDestCompleted, OrganizationId, PIPELINE_STATUS, RoutineDeviceJobId } from '@dogu-private/types';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { RoutineDeviceJob } from '../../../../../db/entity/device-job.entity';
import { DeviceRunner } from '../../../../../db/entity/device-runner.entity';
import { RoutineStep } from '../../../../../db/entity/step.entity';
import { DoguLogger } from '../../../../logger/logger';
import { validateStatusTransition } from '../../../common/runner';
import { DeviceJobMessenger } from '../device-job-messenger';
import { DestRunner } from './dest-runner';
import { StepRunner } from './step-runner';

@Injectable()
export class DeviceJobRunner {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
    @Inject(DeviceJobMessenger)
    private readonly deviceJobMessanger: DeviceJobMessenger,
    @Inject(DestRunner)
    private readonly destRunner: DestRunner,
    @Inject(StepRunner)
    private readonly stepRunner: StepRunner,
  ) {}

  async sendRunDeviceJob(organizationId: OrganizationId, deviceId: DeviceId, deviceJob: RoutineDeviceJob): Promise<void> {
    this.logger.info(`DeviceJob [${deviceJob.routineDeviceJobId}] send run request to device [${deviceId}]`);
    await this.deviceJobMessanger.sendRunDeviceJob(organizationId, deviceId, deviceJob);
  }

  async sendCancelDeviceJob(organizationId: OrganizationId, deviceId: DeviceId, deviceJob: RoutineDeviceJob): Promise<void> {
    this.logger.info(`DeviceJob [${deviceJob.routineDeviceJobId}] send run request to device [${deviceId}]`);
    await this.deviceJobMessanger.sendCancelDeviceJob(organizationId, deviceId, deviceJob);
  }

  async complete(deviceJob: RoutineDeviceJob, event: UpdateDeviceJobStatusRequestBody): Promise<void> {
    const { routineDeviceJobId: deviceJobId, routineSteps: steps, deviceRunnerId } = deviceJob;
    const { stepStatusInfos, deviceJobStatusInfo } = event;
    const incomingStatus = deviceJobStatusInfo.deviceJobStatus;
    const curStatus = deviceJob.status;
    const curStatusStr = PIPELINE_STATUS[curStatus];
    const incomingStatusStr = PIPELINE_STATUS[incomingStatus];

    if (isCompleted(curStatus)) {
      this.logger.debug(`DeviceJob [${deviceJob.routineDeviceJobId}] is already completed with ${curStatusStr} status.`);
      return;
    }

    const isValid = validateStatusTransition(curStatus, incomingStatus);
    if (!isValid) {
      throw new Error(`DeviceJob [${deviceJobId}] can not transition ${curStatusStr} to ${incomingStatusStr} status.`);
    }

    if (!steps || steps.length === 0) {
      throw new Error(`Steps not found: ${deviceJobId}`);
    }

    this.logger.info(`DeviceJob [${deviceJob.routineDeviceJobId}] is in ${curStatusStr} status. transition to ${incomingStatusStr} status...`);
    const curTime = new Date();
    await this.dataSource.transaction(async (manager) => {
      deviceJob.status = incomingStatus;
      deviceJob.completedAt = curTime;
      deviceJob.localInProgressAt = event.deviceJobStatusInfo.localStartedAt;
      deviceJob.localCompletedAt = event.deviceJobStatusInfo.localCompletedAt;
      await manager.getRepository(RoutineDeviceJob).save(deviceJob);

      await this.postUpdate(manager, deviceJobId, steps, stepStatusInfos, deviceRunnerId);
    });
  }

  public async setStatus(manager: EntityManager, deviceJob: RoutineDeviceJob, incomingStatus: PIPELINE_STATUS, serverTimeStamp: Date): Promise<void> {
    if (incomingStatus === PIPELINE_STATUS.IN_PROGRESS) {
      deviceJob.inProgressAt = serverTimeStamp;
      deviceJob.heartbeat = serverTimeStamp;
    } else if (isCompleted(incomingStatus)) {
      deviceJob.completedAt = serverTimeStamp;
    }
    deviceJob.status = incomingStatus;
    await manager.getRepository(RoutineDeviceJob).save(deviceJob);
  }

  private async postUpdate(
    manager: EntityManager,
    deviceJobId: RoutineDeviceJobId,
    steps: RoutineStep[],
    stepStatusInfos: StepStatusInfo[],
    deviceRunnerId: DeviceRunnerId | null,
  ): Promise<void> {
    if (deviceRunnerId) {
      await manager.getRepository(DeviceRunner).update(deviceRunnerId, { isInUse: 0 });
    }

    if (!steps || steps.length === 0) {
      throw new Error(`Steps not found: ${deviceJobId}`);
    }

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepStatusInfo = stepStatusInfos[i];
      if (!stepStatusInfo) {
        throw new Error(`StepStatusInfo not found: ${deviceJobId}`);
      }

      if (!isCompleted(step.status)) {
        step.localInProgressAt = stepStatusInfo.localStartedAt;
        step.localCompletedAt = stepStatusInfo.localCompletedAt;
        step.status = stepStatusInfo.stepStatus === PIPELINE_STATUS.UNSPECIFIED ? PIPELINE_STATUS.SKIPPED : stepStatusInfo.stepStatus;
        await manager.save(step);
      }

      const dests = step.dests ? step.dests : [];
      if (dests.length > 0) {
        for (const dest of dests) {
          if (isDestCompleted(dest.state)) {
            continue;
          }

          if (dest.inProgressAt === null && dest.state === DEST_STATE.PENDING) {
            await this.destRunner.setState(manager, dest, DEST_STATE.SKIPPED, new Date(), null);
            // await setDestState(manager, dest, DEST_STATE.SKIPPED);
          } else if (dest.inProgressAt === null || dest.completedAt === null) {
            // await setDestState(manager, dest, DEST_STATE.UNSPECIFIED, new Date());
            await this.destRunner.setState(manager, dest, DEST_STATE.UNSPECIFIED, new Date(), null);
          }
        }
      }
    }
  }

  async handleHeartBeatExpiredWithCancelRequested(deviceJob: RoutineDeviceJob): Promise<void> {
    const { routineDeviceJobId: deviceJobId, routineSteps: steps } = deviceJob;
    const curStatus = deviceJob.status;
    const curStatusStr = PIPELINE_STATUS[curStatus];
    const incomingStatusStr = PIPELINE_STATUS[PIPELINE_STATUS.CANCELLED];

    if (!steps || steps.length === 0) {
      throw new Error(`cancelByUpdater. Steps not found: ${deviceJobId}`);
    }

    this.logger.info(`DeviceJob [${deviceJob.routineDeviceJobId}] is in ${curStatusStr} status. transition to ${incomingStatusStr} status...`);

    await this.dataSource.transaction(async (manager) => {
      await this.setStatus(manager, deviceJob, PIPELINE_STATUS.CANCELLED, new Date());
      await this.postCancelledDeviceJobByUpdater(manager, steps);
    });
  }

  private async postCancelledDeviceJobByUpdater(manager: EntityManager, steps: RoutineStep[]): Promise<void> {
    for (const step of steps) {
      if (isCompleted(step.status)) {
        continue;
      }

      if (step.status === PIPELINE_STATUS.WAITING) {
        await this.stepRunner.setStatus(manager, step, PIPELINE_STATUS.SKIPPED, new Date(), null);
      } else if (step.status === PIPELINE_STATUS.IN_PROGRESS) {
        await this.stepRunner.setStatus(manager, step, PIPELINE_STATUS.UNSPECIFIED, new Date(), null);
      }

      const dests = step.dests ? step.dests : [];
      if (dests.length > 0) {
        for (const dest of dests) {
          if (isDestCompleted(dest.state)) {
            continue;
          }

          if (dest.inProgressAt === null && dest.state === DEST_STATE.PENDING) {
            await this.destRunner.setState(manager, dest, DEST_STATE.SKIPPED, new Date(), null);
          } else if (dest.inProgressAt === null || dest.completedAt === null) {
            await this.destRunner.setState(manager, dest, DEST_STATE.UNSPECIFIED, new Date(), null);
          }
        }
      }
    }
  }

  public async handleHeartbeatExpiredWithInprogress(deviceJob: RoutineDeviceJob): Promise<void> {
    const { routineSteps: steps } = deviceJob;
    if (!steps || steps.length === 0) {
      throw new Error(`Steps not found: ${deviceJob.routineDeviceJobId}`);
    }
    this.logger.warn(
      `DeviceJob [${deviceJob.routineDeviceJobId}] is heartbeat failure. transition ${PIPELINE_STATUS[deviceJob.status]} to ${PIPELINE_STATUS[PIPELINE_STATUS.FAILURE]} status...`,
    );

    await this.dataSource.transaction(async (manager) => {
      await this.setStatus(manager, deviceJob, PIPELINE_STATUS.FAILURE, new Date());
      await this.postHeartbeatFailureDeviceJob(manager, steps);
    });
  }

  private async postHeartbeatFailureDeviceJob(manager: EntityManager, steps: RoutineStep[]): Promise<void> {
    for (const step of steps) {
      if (isCompleted(step.status)) {
        continue;
      }

      if (step.status === PIPELINE_STATUS.WAITING) {
        await this.stepRunner.setStatus(manager, step, PIPELINE_STATUS.SKIPPED, new Date(), null);
      } else if (step.status === PIPELINE_STATUS.IN_PROGRESS) {
        await this.stepRunner.setStatus(manager, step, PIPELINE_STATUS.UNSPECIFIED, new Date(), null);
      }

      const dests = step.dests ? step.dests : [];
      if (dests.length > 0) {
        for (const dest of dests) {
          if (isDestCompleted(dest.state)) {
            continue;
          }

          if (dest.inProgressAt === null && dest.state === DEST_STATE.PENDING) {
            await this.destRunner.setState(manager, dest, DEST_STATE.SKIPPED, new Date(), null);
          } else if (dest.inProgressAt === null || dest.completedAt === null) {
            await this.destRunner.setState(manager, dest, DEST_STATE.UNSPECIFIED, new Date(), null);
          }
        }
      }
    }
  }
}
