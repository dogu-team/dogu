import { DEST_STATE, isCompleted, isDestCompleted, PIPELINE_STATUS, ProjectId, RoutinePipelineId, UserId } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import { DataSource, EntityManager } from 'typeorm';

import { Dest, Device, Project, RoutineJob, RoutinePipeline, User } from '../../../../../db/entity/index';
import { ProjectSlackRoutine } from '../../../../../db/entity/project-slack-routine.entity';
import { Routine } from '../../../../../db/entity/routine.entity';
import { RoutineStep } from '../../../../../db/entity/step.entity';
import { SlackMessageService } from '../../../../../enterprise/module/integration/slack/slack-message.service';
import { DoguLogger } from '../../../../logger/logger';
import { everyCompleted, everyInStatus, someInStatus } from '../../../common/runner';
import { PipelineService } from '../../pipeline.service';
import { DeviceJobRunner } from './device-job-runner';
import { JobRunner } from './job-runner';
import { StepRunner } from './step-runner';

@Injectable()
export class PipelineRunner {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(StepRunner)
    private readonly stepRunner: StepRunner,
    @Inject(DeviceJobRunner)
    private readonly deviceJobRunner: DeviceJobRunner,
    @Inject(JobRunner)
    private readonly jobRunner: JobRunner,

    @Inject(SlackMessageService)
    private readonly slackMessageService: SlackMessageService,

    @Inject(PipelineService)
    private readonly pipelineService: PipelineService,
    private readonly logger: DoguLogger,
  ) {}

  public async setStatus(manager: EntityManager, pipeline: RoutinePipeline, status: PIPELINE_STATUS): Promise<void> {
    pipeline.status = status;
    if (pipeline.status === PIPELINE_STATUS.IN_PROGRESS) {
      pipeline.inProgressAt = new Date();
    } else if (isCompleted(pipeline.status)) {
      pipeline.completedAt = new Date();

      await this.handleSendingSlackMessage(manager, pipeline, status);
    }

    await manager.getRepository(pipeline.constructor.name).save(pipeline);
  }

  public getNextStatusFromWaiting(pipeline: RoutinePipeline): PIPELINE_STATUS | null {
    const { routinePipelineId: pipelineId, status } = pipeline;
    const statusStr = PIPELINE_STATUS[status];

    if (status !== PIPELINE_STATUS.WAITING) {
      throw new Error(`Pipeline [${pipelineId}] is in ${statusStr} state. can not progressInWaiting.`);
    }

    return PIPELINE_STATUS.IN_PROGRESS;
  }

  public getNextStatusFromInProgress(pipeline: RoutinePipeline): PIPELINE_STATUS | null {
    const { routinePipelineId: pipelineId, status, routineJobs: jobs } = pipeline;
    const statusStr = PIPELINE_STATUS[status];
    if (status !== PIPELINE_STATUS.IN_PROGRESS) {
      throw new Error(`Pipeline [${pipelineId}] is in ${statusStr} state. can not exit.`);
    }
    if (!jobs || jobs.length === 0) {
      throw new Error(`Pipeline [${pipelineId}] has no job`);
    }

    if (!everyCompleted(jobs)) {
      this.logger.info(`Pipeline [${pipelineId}] is not completed. waiting every job completed...`);
      return null;
    }

    const completeState = this.getCompleteStateFromJobsState(pipeline, jobs);
    return completeState;
  }

  public getNextStatusFromCancelRequested(pipeline: RoutinePipeline): PIPELINE_STATUS | null {
    const { routinePipelineId: pipelineId, status, routineJobs: jobs } = pipeline;
    const statusStr = PIPELINE_STATUS[status];
    if (status !== PIPELINE_STATUS.CANCEL_REQUESTED) {
      throw new Error(`Pipeline [${pipelineId}] is in ${statusStr} state. can not exit.`);
    }
    if (!jobs || jobs.length === 0) {
      throw new Error(`Pipeline [${pipelineId}] has no job`);
    }

    if (!everyCompleted(jobs)) {
      this.logger.info(`Pipeline [${pipelineId}] is not completed. waiting every sub runner completed...`);
      return null;
    } else {
      this.logger.info(`Pipeline [${pipelineId}] is completed. transition ${PIPELINE_STATUS[status]} to ${PIPELINE_STATUS.CANCELLED}...`);
      return PIPELINE_STATUS.CANCELLED;
    }

    // const completeState = this.getCompleteStateFromJobsState(pipeline, jobs);
    // this.logger.info(`Pipeline [${pipeline.routinePipelineId}] is completed. transition ${PIPELINE_STATUS[status]} to ${PIPELINE_STATUS[completeState]}...`);
    // return completeState;
  }

  public async postProcess(manager: EntityManager, pipeline: RoutinePipeline): Promise<boolean> {
    const { routinePipelineId: pipelineId, status, routineJobs: jobs } = pipeline;
    const statusStr = PIPELINE_STATUS[status];
    if (!isCompleted(status)) {
      this.logger.error(`Pipeline [${pipelineId}] is in ${statusStr} state. can not postProcess.`);
      return false;
    }
    if (!jobs || jobs.length === 0) {
      this.logger.error(`Pipeline [${pipelineId}] has no job`);
      return false;
    }

    if (!everyCompleted(jobs)) {
      this.logger.error(`Jobs are not completed. Pipeline:${pipelineId}`);
      return false;
    }

    // check deviceJobs
    const deviceJobs = jobs
      .map((job) => job.routineDeviceJobs)
      .flat()
      .filter(notEmpty);
    if (!deviceJobs || deviceJobs.length === 0) {
      this.logger.error(`DeviceJobs are not found. Pipeline:${pipelineId}`);
      return false;
    }
    if (!everyCompleted(deviceJobs)) {
      this.logger.error(`DeviceJobs are not completed. Pipeline:${pipelineId}`);
      return false;
    }

    // check steps
    const steps = deviceJobs
      .map((deviceJob) => deviceJob.routineSteps)
      .flat()
      .filter(notEmpty);
    if (!steps || steps.length === 0) {
      this.logger.error(`Steps are not found. Pipeline:${pipelineId}`);
      return false;
    }

    for (const step of steps) {
      if (null === step.inProgressAt || null === step.completedAt || false === isCompleted(step.status)) {
        this.logger.warn(`Step is unexpected state. Pipeline:${pipelineId}. Step:[${step.routineStepId}][${step.name}]`);
        await manager.getRepository(RoutineStep).update(step.routineStepId, { status: PIPELINE_STATUS.UNSPECIFIED });
      }
    }

    // check dests
    const dests = steps
      .map((step) => step.dests)
      .flat()
      .filter(notEmpty);
    if (!dests || dests.length === 0) {
      return true;
    }

    for (const dest of dests) {
      if (isDestCompleted(dest.state)) continue;

      if (null === dest.inProgressAt || null === dest.completedAt) {
        this.logger.warn(`Dest is unexpected state. Pipeline:${pipelineId}. Dest:[${dest.destId}][${dest.name}]`);
        await manager.getRepository(Dest).update(dest.destId, { state: DEST_STATE.UNSPECIFIED });
      }
    }

    return true;
  }

  private getCompleteStateFromJobsState(pipeline: RoutinePipeline, jobs: RoutineJob[]): PIPELINE_STATUS {
    const { routinePipelineId: pipelineId, status } = pipeline;
    if (everyInStatus(jobs, PIPELINE_STATUS.SUCCESS)) {
      this.logger.info(`Pipeline [${pipelineId}] Every jobs are success.`);
      return PIPELINE_STATUS.SUCCESS;
    } else if (someInStatus(jobs, PIPELINE_STATUS.FAILURE)) {
      this.logger.info(`Pipeline [${pipelineId}] Some jobs are failure.`);
      return PIPELINE_STATUS.FAILURE;
    } else if (someInStatus(jobs, PIPELINE_STATUS.CANCELLED)) {
      this.logger.info(`Pipeline [${pipelineId}] Some jobs are cancelled.`);
      return PIPELINE_STATUS.CANCELLED;
    } else {
      if (status === PIPELINE_STATUS.CANCEL_REQUESTED) {
        return PIPELINE_STATUS.CANCELLED;
      }
      // unknown state
      const jobsStatusStr = jobs
        .map((job) => {
          const statusStr = PIPELINE_STATUS[job.status];
          return `[${job.routineJobId}][${job.name}][${statusStr}]`;
        })
        .join(',');

      this.logger.error(`Pipeline [${pipelineId}] has unknown state job ${jobsStatusStr}`);
      return PIPELINE_STATUS.FAILURE;
    }
  }

  private async handleSendingSlackMessage(manager: EntityManager, pipeline: RoutinePipeline, status: PIPELINE_STATUS): Promise<void> {
    try {
      const project = await manager.getRepository(Project).findOne({ where: { projectId: pipeline.projectId } });
      if (project === null) {
        throw new Error(`Project [${pipeline.projectId}] not found.`);
      }
      const routine = await manager.getRepository(Routine).findOne({ where: { routineId: pipeline.routineId! } });
      if (routine === null) {
        throw new Error(`Routine [${pipeline.routineId}] not found.`);
      }
      const routineSlack = await manager.getRepository(ProjectSlackRoutine).findOne({ where: { projectId: project.projectId, routineId: routine.routineId } });
      if (!routineSlack) {
        return;
      }

      const onSuccess = routineSlack.onSuccess && status === PIPELINE_STATUS.SUCCESS;
      const onFailure = routineSlack.onFailure === 1;
      if (!onSuccess && !onFailure) {
        return;
      }

      const organizationId = project.organizationId;
      const projectId = pipeline.projectId;

      let executorName = 'API';
      if (pipeline.creatorId) {
        const user = await manager.getRepository(User).findOne({ where: { userId: pipeline.creatorId! } });
        if (user === null) {
          throw new Error(`User [${pipeline.creatorId}] not found.`);
        }

        const slackUserId = await this.slackMessageService.getUserId(manager, organizationId, user.email);
        executorName = slackUserId === undefined ? `${user.name}` : `<@${slackUserId}>`;
      }

      const isSucceeded = pipeline.status === PIPELINE_STATUS.SUCCESS;
      const routineName = routine.name;
      const pipelineUrl = `${process.env.DOGU_CONSOLE_URL}/dashboard/${organizationId}/projects/${projectId}/routines/${pipeline.routinePipelineId}`;
      const pipelineIndex = pipeline.index;
      const durationSeconds = dayjs(pipeline.completedAt).diff(dayjs(pipeline.inProgressAt), 'seconds');
      const routineDevices: { routineName: string; devices: { deviecJobUrl: string; device: Device }[] }[] = [];

      if (pipeline.status !== PIPELINE_STATUS.SUCCESS) {
        const routineJobs = pipeline.routineJobs ?? [];

        for (const routineJob of routineJobs) {
          const routineDeviceJobs = routineJob.routineDeviceJobs ?? [];

          for (const routineDeviceJob of routineDeviceJobs) {
            const device = await manager.getRepository(Device).findOne({ where: { deviceId: routineDeviceJob.deviceId } });
            if (device === null) {
              throw new Error(`Device [${routineDeviceJob.deviceId}] not found.`);
            }

            const routineDevice = {
              routineName: routineJob.name,
              devices: routineDeviceJobs.map((routineDeviceJob) => {
                return {
                  deviecJobUrl: `${pipelineUrl}/jobs/${routineJob.routineJobId}/device-jobs/${routineDeviceJob.routineDeviceJobId}`,
                  device: device,
                };
              }),
            };

            routineDevices.push(routineDevice);
          }
        }
      }

      await this.slackMessageService.sendRoutineMessage(manager, organizationId, routineSlack.channelId, {
        isSucceeded,
        executorName,
        durationSeconds,
        routineName,
        pipelineIndex,
        pipelineUrl,
        routineDevices,
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  async cancelPipeline(projectId: ProjectId, pipelineId: RoutinePipelineId, cancelerId: UserId | null): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const pipeline = await this.pipelineService.findPipelineAndSubDatasById(manager, pipelineId);
      if (!pipeline) {
        throw new Error(`Pipeline is not found. Pipeline:${pipelineId} ProjectId:${projectId}`);
      }

      if (pipeline.status === PIPELINE_STATUS.IN_PROGRESS) {
        pipeline.cancelerId = cancelerId;
        await this.setStatus(manager, pipeline, PIPELINE_STATUS.CANCEL_REQUESTED);
        return;
      }

      const jobs = pipeline.routineJobs ? pipeline.routineJobs : [];
      if (!jobs || jobs.length === 0) {
        throw new Error(`Jobs are not found. Pipeline:${pipelineId} ProjectId:${projectId}`);
      }
      const deviceJobs = jobs
        .map((job) => job.routineDeviceJobs)
        .flat()
        .filter(notEmpty);
      if (!deviceJobs || deviceJobs.length === 0) {
        throw new Error(`DeviceJobs are not found. Pipeline:${pipelineId} ProjectId:${projectId}`);
      }
      const steps = deviceJobs
        .map((deviceJob) => deviceJob.routineSteps)
        .flat()
        .filter(notEmpty);
      if (!steps || steps.length === 0) {
        throw new Error(`Steps are not found. Pipeline:${pipelineId} ProjectId:${projectId}`);
      }

      if (pipeline.status === PIPELINE_STATUS.WAITING) {
        for (const job of jobs) {
          await this.jobRunner.setStatus(manager, job, PIPELINE_STATUS.SKIPPED);
        }
        for (const deviceJob of deviceJobs) {
          await this.deviceJobRunner.setStatus(manager, deviceJob, PIPELINE_STATUS.SKIPPED, new Date());
        }
        for (const step of steps) {
          await this.stepRunner.setStatus(manager, step, PIPELINE_STATUS.SKIPPED, new Date(), null);
        }
        await this.setStatus(manager, pipeline, PIPELINE_STATUS.CANCELLED);
        pipeline.cancelerId = cancelerId;
        await manager.getRepository(RoutinePipeline).save(pipeline);
        return;
      }

      this.logger.info(`This pipeline is not in progress or waiting. nothing to do. Pipeline:${pipelineId} ProjectId:${projectId}`);
      return;
    });
  }
}
