import { DEST_STATE, isCompleted, isDestCompleted, PIPELINE_STATUS, ProjectId, RoutinePipelineId, UserId } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Dest, RoutineJob, RoutinePipeline } from '../../../../../db/entity/index';
import { RoutineStep } from '../../../../../db/entity/step.entity';
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
