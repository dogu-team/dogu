import { RoutineJobEdgePropCamel, RoutineJobPropCamel } from '@dogu-private/console';
import { PIPELINE_STATUS } from '@dogu-private/types';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoutineJob } from '../../../db/entity/job.entity';
import { DoguLogger } from '../../logger/logger';
// import { setStatus } from '../../routine/pipeline/common/runner';
import { JobRunner } from '../../routine/pipeline/processor/runner/job-runner';

@Injectable()
export class JobUpdater {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(JobRunner)
    private readonly jobRunner: JobRunner,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    const functionsToCheck = [
      this.checkJobsInWaiting.bind(this), //
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

  private async checkJobsInProgress(): Promise<void> {
    const inProgressJobs = await this.dataSource
      .getRepository(RoutineJob) //
      .createQueryBuilder('job')
      .innerJoinAndSelect(`job.${RoutineJobPropCamel.routineDeviceJobs}`, 'deviceJob')
      .innerJoinAndSelect(`job.${RoutineJobPropCamel.routinePipeline}`, 'pipeline')
      .where('job.status = :status', { status: PIPELINE_STATUS.IN_PROGRESS })
      .getMany();

    if (inProgressJobs.length === 0) {
      return;
    }

    for (const job of inProgressJobs) {
      const nextState = this.jobRunner.getNextStatusFromInProgress(job);
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

      /**
       * (felix): delete를 안하면 에러가 발생함. 원인 파악중
       */
      delete job.routineJobEdges;
      await this.jobRunner.setStatus(this.dataSource.manager, job, nextStatus);
    }
  }
}
