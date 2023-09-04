import { RecordCaseActionPropCamel, RecordDeviceJobPropCamel, RecordPipelinePropCamel, RecordPipelinePropSnake, RecordTestScenarioPropCamel } from '@dogu-private/console';
import { RECORD_PIPELINE_STATE } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RecordPipeline } from '../../../db/entity/record-pipeline.entity';
import { RecordTestScenario } from '../../../db/entity/record-test-scenario.entity';
import { RecordPipelineProcessor } from '../../../enterprise/module/record/processor/record-pipeline-processor';
import { DoguLogger } from '../../logger/logger';

@Injectable()
export class RecordPipelineUpdater {
  constructor(
    @InjectDataSource() //
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    const functionsToCheck = [
      this.checkPipelineWaiting.bind(this), //
      this.checkPipelinesInProgress.bind(this),
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
    const scenarios = await this.dataSource
      .getRepository(RecordTestScenario)
      .createQueryBuilder('scenario')
      .innerJoinAndSelect(`scenario.${RecordTestScenarioPropCamel.recordPipelines}`, 'pipeline')
      .where(`pipeline.${RecordPipelinePropSnake.state} = :${RecordPipelinePropCamel.state}`, { state: RECORD_PIPELINE_STATE.WAITING })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(RecordPipeline, 'subPipeline')
          .where(`subPipeline.${RecordPipelinePropSnake.record_test_scenario_id} = scenario.${RecordPipelinePropSnake.record_test_scenario_id}`)
          .andWhere('subPipeline.state = :state1', { state1: RECORD_PIPELINE_STATE.IN_PROGRESS })
          .getQuery();
        return `NOT EXISTS ${subQuery}`;
      })
      .getMany();

    if (scenarios.length === 0) {
      return;
    }

    const waitingPipelines = scenarios //
      .flatMap((scenario) => scenario.recordPipelines)
      .filter(notEmpty);

    // scenarioId 별로 pipeline을 하나 씩 가져온다.
    const scenarioIds = scenarios.map((scenario) => scenario.recordTestScenarioId);
    const uniqueScenarioIds = [...new Set(scenarioIds)];

    const filteredWaitingPipeline = uniqueScenarioIds //
      .map((scenarioId) => {
        const pipelines = waitingPipelines.filter((pipeline) => pipeline.recordTestScenarioId === scenarioId);
        return pipelines.sort((a, b) => a.index - b.index)[0];
      });

    for (const waitingPipeline of filteredWaitingPipeline) {
      await RecordPipelineProcessor.setState(this.dataSource.manager, waitingPipeline, RECORD_PIPELINE_STATE.IN_PROGRESS);
    }
  }

  private async checkPipelinesInProgress(): Promise<void> {
    const inProgressPipelines = await this.dataSource
      .getRepository(RecordPipeline) //
      .createQueryBuilder('recordPipeline')
      .innerJoinAndSelect(`recordPipeline.${RecordPipelinePropCamel.recordDeviceJobs}`, 'deviceJob')
      .innerJoinAndSelect(`deviceJob.${RecordDeviceJobPropCamel.recordCaseActions}`, 'caseAction')
      .leftJoinAndSelect(`caseAction.${RecordCaseActionPropCamel.recordStepActions}`, 'stepAction')
      .where(`recordPipeline.${RecordPipelinePropCamel.state} = :${RecordPipelinePropCamel.state}`, { state: RECORD_PIPELINE_STATE.IN_PROGRESS })
      .getMany();
    if (inProgressPipelines.length === 0) {
      return;
    }
    for (const pipeline of inProgressPipelines) {
      const nextState = RecordPipelineProcessor.getNextStateFromInProgress(pipeline);
      if (nextState === null) {
        continue;
      }
      this.logger.info(`RecordPipeline [${pipeline.recordPipelineId}] is completed. transition ${RECORD_PIPELINE_STATE[pipeline.state]} to ${RECORD_PIPELINE_STATE[nextState]}...`);
      await this.dataSource.transaction(async (manager) => {
        await RecordPipelineProcessor.setState(manager, pipeline, nextState);
        const postProcessResult = await RecordPipelineProcessor.postProcess(manager, pipeline);
        if (!postProcessResult) {
          this.logger.error(`RecordPipeline ${pipeline.recordPipelineId} state is ${nextState} but postprocess result something wrong.`);
        }
      });
    }

    // const inProgressPipelines = await this.dataSource
    //   .getRepository(RoutinePipeline) //
    //   .createQueryBuilder('pipeline')
    //   .innerJoinAndSelect(`pipeline.${RoutinePipelinePropCamel.routineJobs}`, 'job')
    //   .innerJoinAndSelect(`job.${RoutineJobPropCamel.routineDeviceJobs}`, 'deviceJob')
    //   .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineSteps}`, 'step')
    //   .leftJoinAndSelect(`step.${RoutineStepPropCamel.dests}`, 'dest')
    //   .where('pipeline.status = :status', { status: PIPELINE_STATUS.IN_PROGRESS })
    //   .getMany();
    // if (inProgressPipelines.length === 0) {
    //   return;
    // }
    // for (const pipeline of inProgressPipelines) {
    //   const nextState = this.pipelineRunner.getNextStatusFromInProgress(pipeline);
    //   if (nextState === null) {
    //     continue;
    //   }
    //   this.logger.info(`Pipeline [${pipeline.routinePipelineId}] is completed. transition ${PIPELINE_STATUS[pipeline.status]} to ${PIPELINE_STATUS[nextState]}...`);
    //   await this.dataSource.transaction(async (manager) => {
    //     await this.pipelineRunner.setState(manager, pipeline, nextState);
    //     const postProcessResult = await this.pipelineRunner.postProcess(manager, pipeline);
    //     if (!postProcessResult) {
    //       this.logger.error(`Pipeline ${pipeline.routinePipelineId} status is ${nextState} but postprocess result something wrong.`);
    //     }
    //   });
    // }
  }
}
