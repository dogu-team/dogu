import { isCompleted, PIPELINE_STATUS } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { RoutineDeviceJob } from '../../../../../db/entity/device-job.entity';
import { RoutineJob } from '../../../../../db/entity/index';
import { DoguLogger } from '../../../../logger/logger';
import { everyCompleted, everyInStatus, someInStatus } from '../../../common/runner';

@Injectable()
export class JobRunner {
  constructor(private readonly logger: DoguLogger) {}

  public async setStatus(manager: EntityManager, job: RoutineJob, status: PIPELINE_STATUS): Promise<void> {
    job.status = status;
    if (job.status === PIPELINE_STATUS.IN_PROGRESS) {
      job.inProgressAt = new Date();
    } else if (isCompleted(job.status)) {
      job.completedAt = new Date();
    }

    await manager.getRepository(job.constructor.name).save(job);
  }

  public getNextStatusFromWaiting(job: RoutineJob): PIPELINE_STATUS | null {
    const { name, routineJobId, routinePipeline: pipeline } = job;
    if (!pipeline) {
      throw new Error(`Job [${routineJobId}][${name}] has no pipeline.`);
    }

    if (pipeline.status === PIPELINE_STATUS.WAITING) {
      return null;
    }

    if (pipeline.status === PIPELINE_STATUS.CANCEL_REQUESTED) {
      return PIPELINE_STATUS.SKIPPED;
    }

    const jobEdges = job.routineJobEdges ? job.routineJobEdges : [];
    const parentJobs = jobEdges
      .map((jobEdge) => jobEdge.parentRoutineJob)
      .filter((job): job is RoutineJob => {
        return job !== undefined;
      });

    const parentJobInfos = parentJobs.map((job) => `${job.routineJobId}(${job.name})`).toString();
    if (parentJobs.length === 0) {
      this.logger.info(`Job [${routineJobId}][${job.name}] has no parent jobs. This Job will be in progress.`);
      return PIPELINE_STATUS.IN_PROGRESS;
    }

    if (everyInStatus(parentJobs, PIPELINE_STATUS.SUCCESS)) {
      this.logger.info(`Job [${routineJobId}][${name}]. Every parent jobs are success. It will be in progress. Parent Jobs: ${parentJobInfos}`);
      return PIPELINE_STATUS.IN_PROGRESS;
    }

    if (this.hasParentJobsIssues(parentJobs)) {
      this.logger.info(`Job [${routineJobId}][${name}] has some parent jobs has issues. This Job will be skipped. Parent Jobs: ${parentJobInfos}`);
      return PIPELINE_STATUS.SKIPPED;
    }

    if (everyCompleted(parentJobs)) {
      throw new Error(`Job [${routineJobId}][${name}] every parent jobs are completed. but not all success. Parent Jobs: ${parentJobInfos}`);
    } else {
      this.logger.info(`Job [${routineJobId}][${name}] is waiting for every parent jobs to be completed. Parent Jobs: ${parentJobInfos}`);
      return null;
    }
  }

  public getNextStatusFromInProgress(job: RoutineJob): PIPELINE_STATUS | null {
    const { name, status, routineJobId, routineDeviceJobs: deviceJobs, routinePipeline: pipeline } = job;
    const statusStr = PIPELINE_STATUS[status];
    if (status !== PIPELINE_STATUS.IN_PROGRESS) {
      throw new Error(`Job [${routineJobId}][${name}] is in ${statusStr} state. can not run getNextStatusFromInProgress.`);
    }
    if (!deviceJobs || deviceJobs.length === 0) {
      throw new Error(`Job [${routineJobId}][${name}] has no device running jobs.`);
    }
    if (!pipeline) {
      throw new Error(`Job [${routineJobId}][${name}] has no pipeline.`);
    }

    if (pipeline.status === PIPELINE_STATUS.CANCEL_REQUESTED) {
      if (everyInStatus(deviceJobs, PIPELINE_STATUS.WAITING)) {
        return PIPELINE_STATUS.SKIPPED;
      }
    }

    const deviceJobinfos = deviceJobs.map((deviceJob) => `${deviceJob.routineDeviceJobId}`).toString();
    const isExitable = this.isCompletable(deviceJobs);
    if (!isExitable) {
      this.logger.info(`Job [${routineJobId}][${name}] is waiting for device jobs to complete. Waiting every device jobs to complete.  DeviceJobs: ${deviceJobinfos}`);
      return null;
    }

    const completeState = this.getCompleteStateFromDeviceJobsState(job, deviceJobs);
    return completeState;
  }

  private isCompletable(deviceJobs: RoutineDeviceJob[]): boolean {
    if (everyCompleted(deviceJobs)) {
      return true;
    }
    return false;
  }

  private hasParentJobsIssues(parentJobs: RoutineJob[]): boolean {
    if (
      someInStatus(parentJobs, PIPELINE_STATUS.FAILURE) || //
      someInStatus(parentJobs, PIPELINE_STATUS.CANCELLED) ||
      someInStatus(parentJobs, PIPELINE_STATUS.SKIPPED)
    ) {
      return true;
    }
    return false;
  }

  private getCompleteStateFromDeviceJobsState(job: RoutineJob, deviceJobs: RoutineDeviceJob[]): PIPELINE_STATUS {
    const { name, routineJobId } = job;
    const deviceJobinfos = deviceJobs.map((deviceJob) => `${deviceJob.routineDeviceJobId}`).toString();
    if (everyInStatus(deviceJobs, PIPELINE_STATUS.SUCCESS)) {
      this.logger.info(`Job [${routineJobId}][${name}]. Every DeviceJobs Success.`);
      return PIPELINE_STATUS.SUCCESS;
    } else if (someInStatus(deviceJobs, PIPELINE_STATUS.FAILURE)) {
      this.logger.info(`Job [${routineJobId}][${name}]. Some DeviceJobs are failure. It will be failure. DeviceJobs: ${deviceJobinfos}`);
      return PIPELINE_STATUS.FAILURE;
    } else if (someInStatus(deviceJobs, PIPELINE_STATUS.CANCELLED)) {
      this.logger.info(`Job [${routineJobId}][${name}]. Some DeviceJobs are cancelled. It will be cancelled. DeviceJobs: ${deviceJobinfos}`);
      return PIPELINE_STATUS.CANCELLED;
    } else if (someInStatus(deviceJobs, PIPELINE_STATUS.SKIPPED)) {
      this.logger.info(`Job [${routineJobId}][${name}]. Some DeviceJobs are skipped. It will be failure. DeviceJobs: ${deviceJobinfos}`);
      this.logger.info(`Job [${routineJobId}][${name}] will be skipped.`);
      return PIPELINE_STATUS.SKIPPED;
    } else {
      // unknown state
      this.logger.error(`Job [${routineJobId}][${name}]. Some DeviceJobs are unknown state. DeviceJobs: ${deviceJobinfos}`);
      throw new Error(`Job [${routineJobId}][${name}]. Some DeviceJobs are unknown state. DeviceJobs: ${deviceJobinfos}`);
    }
  }
}
