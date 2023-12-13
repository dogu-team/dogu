import {
  BillingPlanType,
  DeviceUsageState,
  RoutineDeviceJobPropCamel,
  RoutineDeviceJobPropSnake,
  RoutineJobPropCamel,
  RoutinePipelinePropCamel,
  RoutinePipelinePropSnake,
  RoutineStepPropCamel,
} from '@dogu-private/console';
import { DeviceId, isCompleted, OrganizationId, PIPELINE_STATUS, PROJECT_TYPE } from '@dogu-private/types';
import { assertUnreachable, errorify } from '@dogu-tech/common';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Brackets, DataSource } from 'typeorm';
import util from 'util';
import { config } from '../../../config';
import { RoutineDeviceJob } from '../../../db/entity/device-job.entity';
import { DeviceRunner } from '../../../db/entity/device-runner.entity';
import { Message, RetryTransaction } from '../../../db/utils';
import { CloudLicenseSerializable, PaymentRequiredException } from '../../../enterprise/module/license/cloud-license.serializables';
import { CloudLicenseService } from '../../../enterprise/module/license/cloud-license.service';
import { DoguLogger } from '../../logger/logger';
import { RoutineDeviceJobSubscriber } from '../../routine/pipeline/device-job/routine-device-job.subscriber';
import { DeviceJobRunner } from '../../routine/pipeline/processor/runner/device-job-runner';

type RoutineDeviceJobInProgressResult = {
  deviceOwnerOrganizationId: OrganizationId;
  deviceExecutorOrganizationId: OrganizationId;
  deviceId: DeviceId;
  routineDeviceJob: RoutineDeviceJob;
  planType: BillingPlanType;
};

@Injectable()
export class RoutineDeviceJobUpdater {
  private readonly retryTransaction: RetryTransaction;

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly deviceJobRunner: DeviceJobRunner,
    private readonly cloudLicenseService: CloudLicenseService,
    private readonly routineDeviceJobSubscriber: RoutineDeviceJobSubscriber,
  ) {
    this.retryTransaction = new RetryTransaction(this.logger, this.dataSource);
  }

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
    const routineDeviceJobInProgressResults = await this.retryTransaction.serializable(async (context) => {
      const { manager } = context;
      const routineDeviceJobs = await manager.getRepository(RoutineDeviceJob).find({
        where: {
          status: PIPELINE_STATUS.WAITING,
          routineJob: {
            status: PIPELINE_STATUS.IN_PROGRESS,
          },
        },
        relations: {
          routineSteps: true,
          device: {
            organization: true,
          },
          routineJob: {
            routinePipeline: {
              project: true,
            },
          },
        },
        order: {
          createdAt: 'asc',
          routineSteps: {
            routineStepId: 'asc',
          },
        },
      });

      const routineDeviceJobInProgressResults: RoutineDeviceJobInProgressResult[] = [];
      for (const routineDeviceJob of routineDeviceJobs) {
        const { deviceId, device, routineDeviceJobId, routineSteps, routineJob } = routineDeviceJob;
        if (!device) {
          throw new InternalServerErrorException({
            reason: 'device must not be null',
            routineDeviceJobId,
          });
        }

        const { organizationId: deviceOwnerOrganizationId } = device;

        if (!device.organization) {
          throw new InternalServerErrorException({
            reason: 'device.organization must not be null',
            routineDeviceJobId,
          });
        }

        if (!routineSteps || routineSteps.length === 0) {
          throw new InternalServerErrorException({
            reason: 'deviceJob must have steps',
            routineDeviceJobId,
          });
        }

        if (!routineJob) {
          throw new InternalServerErrorException({
            reason: 'routineJob must not be null',
            routineDeviceJobId,
          });
        }

        const { routinePipeline } = routineJob;
        if (!routinePipeline) {
          throw new InternalServerErrorException({
            reason: 'routinePipeline must not be null',
            routineDeviceJobId,
          });
        }

        const { project } = routinePipeline;
        if (!project) {
          throw new InternalServerErrorException({
            reason: 'project must not be null',
            routineDeviceJobId,
          });
        }

        const { organizationId: deviceExecutorOrganizationId, type: projectType } = project;

        const deviceRunner = await manager.getRepository(DeviceRunner).findOne({ where: { deviceId, isInUse: 0 } });
        if (!deviceRunner) {
          continue;
        }

        if (device.organization.shareable && device.usageState !== DeviceUsageState.AVAILABLE) {
          continue;
        }

        // TODO: seperate function condition to planType, planType to validate
        let planType: BillingPlanType | undefined;
        let paymentRequiredException: PaymentRequiredException | undefined;
        const cloudLicense = await this.cloudLicenseService.getLicenseInfo(deviceExecutorOrganizationId);
        try {
          if (device.organization.shareable) {
            switch (projectType) {
              case PROJECT_TYPE.WEB: {
                await CloudLicenseSerializable.validateWebTestAutomation(context, cloudLicense);
                planType = 'web-test-automation';
                break;
              }
              case PROJECT_TYPE.APP: {
                await CloudLicenseSerializable.validateMobileAppTestAutomation(context, cloudLicense);
                planType = 'mobile-app-test-automation';
                break;
              }
              case PROJECT_TYPE.GAME: {
                await CloudLicenseSerializable.validateMobileGameTestAutomation(context, cloudLicense);
                planType = 'mobile-game-test-automation';
                break;
              }
              case PROJECT_TYPE.CUSTOM: {
                throw new InternalServerErrorException({
                  reason: 'custom project is not supported with shareable device',
                  routineDeviceJobId,
                });
              }
              default: {
                assertUnreachable(projectType);
              }
            }
          } else {
            if (device.isHost !== 0) {
              await CloudLicenseSerializable.validateSelfDeviceBrowser(context, cloudLicense);
              planType = 'self-device-farm-browser';
            } else {
              await CloudLicenseSerializable.validateSelfDeviceMobile(context, cloudLicense);
              planType = 'self-device-farm-mobile';
            }
          }
        } catch (e) {
          if (e instanceof PaymentRequiredException) {
            paymentRequiredException = e;
          } else {
            throw e;
          }
        }

        if (paymentRequiredException) {
          if (paymentRequiredException.retryable) {
            continue;
          } else {
            // TODO: complete process
            await this.deviceJobRunner.setStatus(manager, routineDeviceJob, PIPELINE_STATUS.FAILURE, new Date());
            continue;
          }
        }

        if (!planType) {
          throw new InternalServerErrorException({
            reason: 'planType must not be null',
            routineDeviceJobId,
          });
        }

        this.logger.info(`device-job ${routineDeviceJobId} status change to in_progress.`);

        deviceRunner.isInUse = 1;
        await manager.save(deviceRunner);

        routineDeviceJob.deviceRunnerId = deviceRunner.deviceRunnerId;
        await this.deviceJobRunner.setStatus(manager, routineDeviceJob, PIPELINE_STATUS.IN_PROGRESS, new Date());

        if (device.organization.shareable) {
          device.usageState = DeviceUsageState.IN_USE;
          await manager.save(device);
        }

        routineDeviceJobInProgressResults.push({
          deviceOwnerOrganizationId,
          deviceExecutorOrganizationId,
          deviceId,
          routineDeviceJob,
          planType,
        });
      }

      return routineDeviceJobInProgressResults;
    });

    routineDeviceJobInProgressResults.forEach((routineDeviceJobInProgressResult) => {
      const { routineDeviceJob, planType, deviceExecutorOrganizationId, deviceId, deviceOwnerOrganizationId } = routineDeviceJobInProgressResult;
      const { routineDeviceJobId } = routineDeviceJob;
      this.cloudLicenseService
        .startUpdate({
          organizationId: deviceExecutorOrganizationId,
          planType,
          key: 'routineDeviceJobId',
          value: routineDeviceJobId.toString(),
        })
        .then((stopUpdate) => {
          const handler: (message: Message<RoutineDeviceJob>) => void = (message) => {
            if (message.data.routineDeviceJobId !== routineDeviceJobId) {
              return;
            }

            if (!isCompleted(message.data.status)) {
              return;
            }

            this.routineDeviceJobSubscriber.emitter.off('message', handler);
            stopUpdate();
          };
          this.routineDeviceJobSubscriber.emitter.on('message', handler);
        })
        .catch((error) => {
          this.logger.error('startUpdate process error', { error: errorify(error) });
        });

      this.deviceJobRunner
        .sendRunDeviceJob({
          organizationId: deviceOwnerOrganizationId,
          deviceId,
          routineDeviceJob,
        })
        .catch((error) => {
          this.logger.error('sendRunDeviceJob process error', { error: errorify(error) });
        });
    });
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
