import { RoutineDeviceJobPropCamel, RoutineJobPropCamel, RoutinePipelinePropCamel, RoutinePropCamel, RoutineStepPropCamel } from '@dogu-private/console';
import { PIPELINE_STATUS } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull } from 'typeorm';
import { RoutinePipeline } from '../../../db/entity/pipeline.entity';
import { Routine } from '../../../db/entity/routine.entity';
import { DoguLogger } from '../../logger/logger';
// import { setStatus } from '../../routine/pipeline/common/runner';
import { PipelineRunner } from '../../routine/pipeline/processor/runner/pipeline-runner';

@Injectable()
export class PipelineUpdater {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(PipelineRunner)
    private readonly pipelineRunner: PipelineRunner,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    const functionsToCheck = [
      this.checkPipelineWaiting.bind(this), //
      this.checkPipelinesInProgress.bind(this),
      this.checkPipelinesInCancelReqeusted.bind(this),
      this.checkInstantPipelinesWaiting.bind(this),
    ];

    for (const checkFunction of functionsToCheck) {
      try {
        await checkFunction.call(this);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async checkPipelineWaiting(): Promise<void> {
    const routines = await this.dataSource //
      .getRepository(Routine)
      .createQueryBuilder('routine')
      .innerJoinAndSelect(`routine.${RoutinePropCamel.routinePipelines}`, 'pipeline')
      .where('pipeline.status = :status', { status: PIPELINE_STATUS.WAITING })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(RoutinePipeline, 'subPipeline')
          .where('subPipeline.routine_id = routine.routine_id')
          .andWhere('subPipeline.status = :status1', { status1: PIPELINE_STATUS.IN_PROGRESS })
          .getQuery();
        return `NOT EXISTS ${subQuery}`;
      })
      .getMany();

    if (routines.length === 0) {
      return;
    }
    const waitingPipelines = routines //
      .flatMap((routine) => routine.routinePipelines)
      .filter(notEmpty);

    // routineId 별로 pipeline을 하나 씩 가져온다.
    const routineIds = routines.map((routine) => routine.routineId);
    const uniqueRoutineIds = [...new Set(routineIds)];

    const filteredWaitingPipeline = uniqueRoutineIds //
      .map((routineId) => {
        const pipelines = waitingPipelines.filter((pipeline) => pipeline.routineId === routineId);
        return pipelines.sort((a, b) => a.index - b.index)[0];
      });

    for (const waitingPipeline of filteredWaitingPipeline) {
      await this.pipelineRunner.setStatus(this.dataSource.manager, waitingPipeline, PIPELINE_STATUS.IN_PROGRESS);
    }
  }

  private async checkInstantPipelinesWaiting(): Promise<void> {
    const pipelines = await this.dataSource.getRepository(RoutinePipeline).find({
      where: {
        status: PIPELINE_STATUS.WAITING,
        routineId: IsNull(),
      },
    });
    if (pipelines.length === 0) {
      return;
    }
    for (const pipeline of pipelines) {
      await this.pipelineRunner.setStatus(this.dataSource.manager, pipeline, PIPELINE_STATUS.IN_PROGRESS);
    }
  }

  private async checkPipelinesInCancelReqeusted(): Promise<void> {
    const cancelRequestedPipelines = await this.dataSource
      .getRepository(RoutinePipeline) //
      .createQueryBuilder('pipeline')
      .innerJoinAndSelect(`pipeline.${RoutinePipelinePropCamel.routineJobs}`, 'job')
      .innerJoinAndSelect(`job.${RoutineJobPropCamel.routineDeviceJobs}`, 'deviceJob')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineSteps}`, 'step')
      .leftJoinAndSelect(`step.${RoutineStepPropCamel.dests}`, 'dest')
      .where('pipeline.status = :status', { status: PIPELINE_STATUS.CANCEL_REQUESTED })
      .getMany();

    if (cancelRequestedPipelines.length === 0) {
      return;
    }

    for (const pipeline of cancelRequestedPipelines) {
      const nextState = this.pipelineRunner.getNextStatusFromCancelRequested(pipeline);
      if (nextState === null) {
        continue;
      }
      await this.dataSource.transaction(async (manager) => {
        await this.pipelineRunner.setStatus(manager, pipeline, nextState);
        const postProcessResult = await this.pipelineRunner.postProcess(manager, pipeline);
        if (!postProcessResult) {
          this.logger.error(`Pipeline ${pipeline.routinePipelineId} status is ${nextState} but postprocess result something wrong.`);
        }
      });
    }
  }

  private async checkPipelinesInProgress(): Promise<void> {
    const inProgressPipelines = await this.dataSource
      .getRepository(RoutinePipeline) //
      .createQueryBuilder('pipeline')
      .innerJoinAndSelect(`pipeline.${RoutinePipelinePropCamel.routineJobs}`, 'job')
      .innerJoinAndSelect(`job.${RoutineJobPropCamel.routineDeviceJobs}`, 'deviceJob')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineSteps}`, 'step')
      .leftJoinAndSelect(`step.${RoutineStepPropCamel.dests}`, 'dest')
      .where('pipeline.status = :status', { status: PIPELINE_STATUS.IN_PROGRESS })
      .getMany();

    if (inProgressPipelines.length === 0) {
      return;
    }

    for (const pipeline of inProgressPipelines) {
      const nextState = this.pipelineRunner.getNextStatusFromInProgress(pipeline);
      if (nextState === null) {
        continue;
      }
      this.logger.info(`Pipeline [${pipeline.routinePipelineId}] is completed. transition ${PIPELINE_STATUS[pipeline.status]} to ${PIPELINE_STATUS[nextState]}...`);
      await this.dataSource.transaction(async (manager) => {
        await this.pipelineRunner.setStatus(manager, pipeline, nextState);
        const postProcessResult = await this.pipelineRunner.postProcess(manager, pipeline);
        if (!postProcessResult) {
          this.logger.error(`Pipeline ${pipeline.routinePipelineId} status is ${nextState} but postprocess result something wrong.`);
        }
      });
    }
  }
}
