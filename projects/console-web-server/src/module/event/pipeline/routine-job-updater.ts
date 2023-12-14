import { RoutineJobEdgePropCamel, RoutineJobPropCamel } from '@dogu-private/console';
import { PIPELINE_STATUS } from '@dogu-private/types';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { RoutineJob } from '../../../db/entity/job.entity';
import { DoguLogger } from '../../logger/logger';
import { JobRunner } from '../../routine/pipeline/processor/runner/job-runner';

@Injectable()
export class RoutineJobUpdater {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(JobRunner)
    private readonly jobRunner: JobRunner,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    const functionsToCheck = [
      this.checkJobsInWaiting.bind(this), //
      this.checkJobsWaitingToStartOrInProgress.bind(this),
    ];

    for (const checkFunction of functionsToCheck) {
      try {
        await checkFunction.call(this);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async checkJobsWaitingToStartOrInProgress(): Promise<void> {
    const jobs = await this.dataSource.getRepository(RoutineJob).find({
      where: {
        status: In([PIPELINE_STATUS.WAITING_TO_START, PIPELINE_STATUS.IN_PROGRESS]),
      },
      relations: {
        routineDeviceJobs: true,
        routinePipeline: true,
      },
    });

    if (jobs.length === 0) {
      return;
    }

    for (const job of jobs) {
      const nextState = this.jobRunner.getNextStatusFromWaitingToStartOrInProgress(job);
      if (nextState === null) {
        continue;
      }

      await this.jobRunner.setStatus(this.dataSource.manager, job, nextState);
    }
  }

  private async checkJobsInWaiting(): Promise<void> {
    const waitingJobs = await this.dataSource
      .getRepository(RoutineJob) //
      .createQueryBuilder('job')
      .innerJoinAndSelect(`job.${RoutineJobPropCamel.routinePipeline}`, 'pipeline')
      .leftJoinAndSelect(`job.${RoutineJobPropCamel.routineJobEdges}`, 'jobEdges')
      .leftJoinAndSelect(`jobEdges.${RoutineJobEdgePropCamel.parentRoutineJob}`, 'parentJob')
      .where('job.status = :status', { status: PIPELINE_STATUS.WAITING })
      .getMany();

    if (waitingJobs.length === 0) {
      return;
    }

    for (const job of waitingJobs) {
      const nextStatus = this.jobRunner.getNextStatusFromWaiting(job);
      if (nextStatus === null) {
        continue;
      }

      await this.jobRunner.setStatus(this.dataSource.manager, job, nextStatus);
    }
  }
}
