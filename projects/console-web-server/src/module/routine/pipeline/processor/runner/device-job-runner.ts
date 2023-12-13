import { DeviceUsageState } from '@dogu-private/console';
import { StepStatusInfo, UpdateDeviceJobStatusRequestBody } from '@dogu-private/console-host-agent';
import { DEST_STATE, DeviceId, DeviceRunnerId, isCompleted, isDestCompleted, OrganizationId, PIPELINE_STATUS, RoutineDeviceJobId } from '@dogu-private/types';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { RoutineDeviceJob } from '../../../../../db/entity/device-job.entity';
import { DeviceRunner } from '../../../../../db/entity/device-runner.entity';
import { RoutineStep } from '../../../../../db/entity/step.entity';
import { DoguLogger } from '../../../../logger/logger';
import { DeviceCommandService } from '../../../../organization/device/device-command.service';
import { validateStatusTransition } from '../../../common/runner';
import { DeviceJobMessenger } from '../device-job-messenger';
import { DestRunner } from './dest-runner';
import { StepRunner } from './step-runner';

type SendRunDeviceJobOptions = {
  organizationId: OrganizationId;
  deviceId: DeviceId;
  routineDeviceJob: RoutineDeviceJob;
};

type PostUpdateResult = {
  resetDevice: {
    organizationId: OrganizationId;
    deviceId: DeviceId;
    serial: string;
  } | null;
};

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
    private readonly deviceCommandService: DeviceCommandService,
  ) {}

  async sendRunDeviceJob(options: SendRunDeviceJobOptions): Promise<void> {
    const { organizationId, deviceId, routineDeviceJob } = options;
    this.logger.info(`DeviceJob [${routineDeviceJob.routineDeviceJobId}] send run request to device [${deviceId}]`);
    await this.deviceJobMessanger.sendRunDeviceJob(organizationId, deviceId, routineDeviceJob);
  }

  async sendCancelDeviceJob(organizationId: OrganizationId, deviceId: DeviceId, executorOrganizationId: OrganizationId, deviceJob: RoutineDeviceJob): Promise<void> {
    this.logger.info(`DeviceJob [${deviceJob.routineDeviceJobId}] send run request to device [${deviceId}]`);
    await this.deviceJobMessanger.sendCancelDeviceJob(organizationId, deviceId, executorOrganizationId, deviceJob);
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
    const result = await this.dataSource.transaction(async (manager) => {
      deviceJob.status = incomingStatus;
      deviceJob.completedAt = curTime;
      deviceJob.localInProgressAt = event.deviceJobStatusInfo.localStartedAt;
      deviceJob.localCompletedAt = event.deviceJobStatusInfo.localCompletedAt;
      await manager.getRepository(RoutineDeviceJob).save(deviceJob);

      return await this.postUpdate(manager, deviceJobId, steps, stepStatusInfos, deviceRunnerId);
    });

    if (result.resetDevice) {
      const { organizationId, deviceId, serial } = result.resetDevice;
      this.deviceCommandService.reset(organizationId, deviceId, serial).catch((error) => {
        this.logger.error(`DeviceJob [${deviceJobId}] reset error: ${error}`);
      });
    }
  }

  public async setStatus(manager: EntityManager, deviceJob: RoutineDeviceJob, incomingStatus: PIPELINE_STATUS, serverTimeStamp: Date): Promise<void> {
    if (incomingStatus === PIPELINE_STATUS.IN_PROGRESS) {
      deviceJob.inProgressAt = serverTimeStamp;
      deviceJob.heartbeat = serverTimeStamp;
    } else if (isCompleted(incomingStatus)) {
      deviceJob.completedAt = serverTimeStamp;
    }
    deviceJob.status = incomingStatus;
    await manager.save(deviceJob);
  }

  private async postUpdate(
    manager: EntityManager,
    deviceJobId: RoutineDeviceJobId,
    steps: RoutineStep[],
    stepStatusInfos: StepStatusInfo[],
    deviceRunnerId: DeviceRunnerId | null,
  ): Promise<PostUpdateResult> {
    const result: PostUpdateResult = {
      resetDevice: null,
    };

    if (deviceRunnerId) {
      const found = await manager.getRepository(DeviceRunner).findOne({
        where: {
          deviceRunnerId,
        },
        relations: {
          device: {
            organization: true,
          },
        },
      });
      if (found) {
        found.isInUse = 0;
        await manager.save(found);

        const device = found.device;
        if (device && device.organization.shareable) {
          device.usageState = DeviceUsageState.PREPARING;
          const saved = await manager.save(device);
          const { organizationId, deviceId, serial } = saved;
          result.resetDevice = {
            organizationId,
            deviceId,
            serial,
          };
        }
      }
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
          } else if (dest.inProgressAt === null || dest.completedAt === null) {
            await this.destRunner.setState(manager, dest, DEST_STATE.UNSPECIFIED, new Date(), null);
          }
        }
      }
    }

    return result;
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
      await this.postCancelledDeviceJobByUpdater(manager, steps, deviceJob.deviceRunnerId);
    });
  }

  private async postCancelledDeviceJobByUpdater(manager: EntityManager, steps: RoutineStep[], deviceRunnerId: DeviceRunnerId | null): Promise<void> {
    if (deviceRunnerId) {
      await manager.getRepository(DeviceRunner).update(deviceRunnerId, { isInUse: 0 });
    }

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
      await this.postHeartbeatFailureDeviceJob(manager, steps, deviceJob.deviceRunnerId);
    });
  }

  private async postHeartbeatFailureDeviceJob(manager: EntityManager, steps: RoutineStep[], deviceRunnerId: DeviceRunnerId | null): Promise<void> {
    if (deviceRunnerId) {
      await manager.getRepository(DeviceRunner).update(deviceRunnerId, { isInUse: 0 });
    }

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
