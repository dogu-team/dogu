import {
  DevicePropCamel,
  DeviceUsageState,
  RoutineDeviceJobPropCamel,
  RoutineDeviceJobPropSnake,
  RoutineJobPropCamel,
  RoutinePipelinePropCamel,
  RoutinePipelinePropSnake,
  RoutineStepPropCamel,
} from '@dogu-private/console';
import { PIPELINE_STATUS } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import _ from 'lodash';
import { Brackets, DataSource } from 'typeorm';
import util from 'util';
import { config } from '../../../config';
import { RoutineDeviceJob } from '../../../db/entity/device-job.entity';
import { DeviceRunner } from '../../../db/entity/device-runner.entity';
import { DoguLogger } from '../../logger/logger';
import { DeviceJobRunner } from '../../routine/pipeline/processor/runner/device-job-runner';
import { StepRunner } from '../../routine/pipeline/processor/runner/step-runner';

@Injectable()
export class DeviceJobUpdater {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource, //
    @Inject(DeviceJobRunner)
    private readonly deviceJobRunner: DeviceJobRunner,
    @Inject(StepRunner)
    private readonly stepRunner: StepRunner,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    const functionsToCheck = [
      //waiting device job
      this.checkWaitingDeviceJobsWithInProgressJob.bind(this), //
      this.checkWaitingDeviceJobsWithSkippedJob.bind(this),

      //cancel requested device job
      this.sendCancelRequest.bind(this), //
      this.checkCancelRequestedAndExpiredHeartBeatDeviceJobs.bind(this),
      this.checkHeartBeatExpiredDeviceJobs.bind(this),
      this.checkWaitingDeviceJobsWithCancelRequestedPipeline.bind(this),
    ];

    for (const checkFunction of functionsToCheck) {
      try {
        await checkFunction.call(this);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async checkWaitingDeviceJobsWithCancelRequestedPipeline(): Promise<void> {
    const waitingDeviceJobs = await this.dataSource
      .getRepository(RoutineDeviceJob) //
      .createQueryBuilder('deviceJob')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineJob}`, 'job')
      .innerJoinAndSelect(`job.${RoutineJobPropCamel.routinePipeline}`, 'pipeline', `pipeline.${RoutinePipelinePropSnake.status} =:pipelineStatus`, {
        pipelineStatus: PIPELINE_STATUS.CANCEL_REQUESTED,
      })
      .where({ status: PIPELINE_STATUS.WAITING })
      .getMany();

    if (waitingDeviceJobs.length === 0) {
      return;
    }

    for (const deviceJob of waitingDeviceJobs) {
      await this.deviceJobRunner.setStatus(this.dataSource.manager, deviceJob, PIPELINE_STATUS.SKIPPED, new Date());
    }
  }

  private async checkWaitingDeviceJobsWithSkippedJob(): Promise<void> {
    const waitingDeviceJobs = await this.dataSource
      .getRepository(RoutineDeviceJob) //
      .createQueryBuilder('deviceJob')
      .innerJoinAndSelect(
        `deviceJob.${RoutineDeviceJobPropCamel.routineJob}`, //
        'job',
        `job.${RoutineJobPropCamel.status} =:jobStatus`,
        { jobStatus: PIPELINE_STATUS.SKIPPED },
      )
      .where({ status: PIPELINE_STATUS.WAITING })
      .getMany();

    if (waitingDeviceJobs.length === 0) {
      return;
    }

    for (const deviceJob of waitingDeviceJobs) {
      await this.deviceJobRunner.setStatus(this.dataSource.manager, deviceJob, PIPELINE_STATUS.SKIPPED, new Date());
    }
  }

  private async checkWaitingDeviceJobsWithInProgressJob(): Promise<void> {
    const waitingDeviceJobs = await this.dataSource
      .getRepository(RoutineDeviceJob) //
      .createQueryBuilder('deviceJob')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineSteps}`, 'step')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.device}`, 'device')
      .innerJoinAndSelect(
        `deviceJob.${RoutineDeviceJobPropCamel.routineJob}`, //
        'job',
        `job.${RoutineJobPropCamel.status} =:jobStatus`,
        { jobStatus: PIPELINE_STATUS.IN_PROGRESS },
      )
      .leftJoinAndSelect(
        `device.${DevicePropCamel.routineDeviceJobs}`, //
        'deviceJobs',
        `deviceJobs.${RoutineDeviceJobPropSnake.status} =:deviceJobsStatus`,
        { deviceJobsStatus: PIPELINE_STATUS.IN_PROGRESS },
      )
      .innerJoinAndSelect(`job.${RoutineJobPropCamel.routinePipeline}`, 'pipeline')
      .innerJoinAndSelect(`pipeline.${RoutinePipelinePropSnake.project}`, 'project')
      .orderBy(`deviceJob.${RoutineDeviceJobPropCamel.routineDeviceJobId}`, 'ASC')
      .orderBy(`step.${RoutineStepPropCamel.routineStepId}`, 'ASC')
      .where({ status: PIPELINE_STATUS.WAITING })
      .getMany();

    if (waitingDeviceJobs.length === 0) {
      return;
    }

    const deviceJobGroups = _.groupBy(waitingDeviceJobs, (deviceJob) => deviceJob.deviceId);
    const deviceIds = Object.keys(deviceJobGroups);
    for (const deviceId of deviceIds) {
      const waitingRoutineDeviceJobsByDeviceId = deviceJobGroups[deviceId];
      const sortedWaitingDeviceJobs = waitingRoutineDeviceJobsByDeviceId.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const deviceRunners = await this.dataSource.getRepository(DeviceRunner).find({ where: { deviceId, isInUse: 0 }, relations: { device: true } });
      const promises = _.zip(deviceRunners, sortedWaitingDeviceJobs).map(async ([deviceRunner, deviceJob]) => {
        if (!deviceRunner || !deviceJob) {
          return;
        }

        const { device } = deviceJob;
        const { deviceId, organizationId } = device!;
        const steps = deviceJob.routineSteps;
        if (!steps || steps.length === 0) {
          throw new Error(`deviceJob ${deviceJob.routineDeviceJobId} has no steps`);
        }

        this.logger.info(`device-job ${deviceJob.routineDeviceJobId} status change to in_progress.`);

        await this.dataSource.manager.transaction(async (manager) => {
          await manager.getRepository(DeviceRunner).update({ deviceRunnerId: deviceRunner.deviceRunnerId }, { isInUse: 1 });
          deviceJob.deviceRunnerId = deviceRunner.deviceRunnerId;
          await this.deviceJobRunner.setStatus(manager, deviceJob, PIPELINE_STATUS.IN_PROGRESS, new Date());
          const device = deviceRunner.device;
          if (device) {
            device.usageState = DeviceUsageState.IN_USE;
            await manager.save(device);
          }
        });

        this.deviceJobRunner.sendRunDeviceJob(organizationId, deviceId, deviceJob).catch((error) => {
          this.logger.error('sendRunDeviceJob process error', { error: errorify(error) });
        });
      });

      await Promise.allSettled(promises);
    }
  }

  private async checkHeartBeatExpiredDeviceJobs(): Promise<void> {
    const deviceJobs = await this.dataSource //
      .getRepository(RoutineDeviceJob)
      .createQueryBuilder('deviceJob')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineSteps}`, 'step')
      .leftJoinAndSelect(`step.${RoutineStepPropCamel.dests}`, 'dest')
      .where(
        new Brackets((qb) => {
          qb.where(`deviceJob.${RoutineDeviceJobPropSnake.heartbeat} IS NOT NULL`);
          qb.andWhere(`deviceJob.${RoutineDeviceJobPropSnake.heartbeat} < NOW() - INTERVAL '${config.deviceJob.heartbeat.allowedSeconds} SECONDS'`);
          qb.andWhere(`deviceJob.${RoutineDeviceJobPropCamel.status} = :deviceJobStatus`, { deviceJobStatus: PIPELINE_STATUS.IN_PROGRESS });
        }),
      )
      .getMany();

    if (deviceJobs.length === 0) {
      return;
    }
    for (const deviceJob of deviceJobs) {
      this.logger.error(`in_progress deviceJob heartbeat is expired. deviceJobId: ${deviceJob.routineDeviceJobId}`);
      this.logger.info(`deviceJob status is changed to failure. deviceJobId: ${deviceJob.routineDeviceJobId}`);
      await this.deviceJobRunner.handleHeartbeatExpiredWithInprogress(deviceJob);
    }
  }

  private async sendCancelRequest(): Promise<void> {
    const deviceJobs = await this.dataSource //
      .getRepository(RoutineDeviceJob)
      .createQueryBuilder('deviceJob')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineSteps}`, 'step')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineJob}`, 'job')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.device}`, 'device')
      .innerJoinAndSelect(`job.${RoutineJobPropCamel.routinePipeline}`, 'pipeline')
      .innerJoinAndSelect(`pipeline.${RoutinePipelinePropCamel.project}`, 'project')
      .where(`pipeline.${RoutinePipelinePropCamel.status} = :pipelineStatus`, { pipelineStatus: PIPELINE_STATUS.CANCEL_REQUESTED })
      .andWhere(
        new Brackets((qb) => {
          qb.where(`deviceJob.${RoutineDeviceJobPropSnake.heartbeat} IS NOT NULL`);
          qb.andWhere(`deviceJob.${RoutineDeviceJobPropSnake.heartbeat} > NOW() - INTERVAL '${config.deviceJob.heartbeat.allowedSeconds} SECONDS'`);
          qb.andWhere(`deviceJob.${RoutineDeviceJobPropCamel.status} = :stepStatus`, { stepStatus: PIPELINE_STATUS.IN_PROGRESS });
          qb.orWhere(`deviceJob.${RoutineDeviceJobPropCamel.status} = :stepStatus2`, { stepStatus2: PIPELINE_STATUS.CANCEL_REQUESTED });
        }),
      )
      .getMany();

    if (deviceJobs.length === 0) {
      return;
    }

    for (const deviceJob of deviceJobs) {
      const { routineDeviceJobId: deviceJobId, deviceId, device } = deviceJob;
      if (!device) {
        this.logger.error(`device is null. deviceJobId: ${deviceJobId}`);
        continue;
      }
      this.logger.info(`cancel_requested device-job heartbeat is alive. cancel request to HA. deviceJobId: ${deviceJobId}`);
      await this.deviceJobRunner.setStatus(this.dataSource.manager, deviceJob, PIPELINE_STATUS.CANCEL_REQUESTED, new Date());

      const { routineJob } = deviceJob;
      if (!routineJob) {
        this.logger.error(`routineJob is null. deviceJobId: ${deviceJobId}`);
        continue;
      }

      const { routinePipeline } = routineJob;
      if (!routinePipeline) {
        this.logger.error(`routinePipeline is null. deviceJobId: ${deviceJobId}`);
        continue;
      }

      const { project } = routinePipeline;
      if (!project) {
        this.logger.error(`project is null. deviceJobId: ${deviceJobId}`);
        continue;
      }

      const { organizationId: executorOrganizationId } = project;

      try {
        await this.deviceJobRunner.sendCancelDeviceJob(device.organizationId, deviceId, executorOrganizationId, deviceJob);
      } catch (error) {
        this.logger.error(`sendCancelDeviceJob error. deviceJobId: ${deviceJobId}, error: ${util.inspect(error)}`);
      }
    }
  }

  private async checkCancelRequestedAndExpiredHeartBeatDeviceJobs(): Promise<void> {
    const deviceJobs = await this.dataSource //
      .getRepository(RoutineDeviceJob)
      .createQueryBuilder('deviceJob')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineJob}`, 'job')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineSteps}`, 'step')
      .innerJoinAndSelect(`job.${RoutineJobPropCamel.routinePipeline}`, 'pipeline')
      .where(`pipeline.${RoutinePipelinePropSnake.status} = :pipelineStatus`, { pipelineStatus: PIPELINE_STATUS.CANCEL_REQUESTED })
      .andWhere(
        new Brackets((qb) => {
          qb.where(`deviceJob.${RoutineDeviceJobPropSnake.heartbeat} IS NOT NULL`);
          qb.andWhere(`deviceJob.${RoutineDeviceJobPropSnake.heartbeat} < NOW() - INTERVAL '${config.deviceJob.heartbeat.allowedSeconds} SECONDS'`);
          qb.andWhere(`deviceJob.${RoutineDeviceJobPropCamel.status} = :deviceJobStatus`, { deviceJobStatus: PIPELINE_STATUS.CANCEL_REQUESTED });
        }),
      )
      .getMany();

    for (const deviceJob of deviceJobs) {
      this.logger.warn(`cancel_requested device-job heartbeat is expired. deviceJobId: ${deviceJob.routineDeviceJobId}`);
      this.logger.info(`deviceJob status is changed to cancelled. deviceJobId: ${deviceJob.routineDeviceJobId}`);
      await this.deviceJobRunner.handleHeartBeatExpiredWithCancelRequested(deviceJob);
    }
  }
}
