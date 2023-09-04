import { isRecordCompleted } from '@dogu-private/console';
import { RECORD_PIPELINE_STATE } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { EntityManager } from 'typeorm';
import { RecordCaseAction } from '../../../../db/entity/record-case-action.entity';
import { RecordDeviceJob } from '../../../../db/entity/record-device-job.entity';
import { RecordPipeline } from '../../../../db/entity/record-pipeline.entity';
import { RecordStepAction } from '../../../../db/entity/record-step-action.entity';
import { logger } from '../../../../module/logger/logger.instance';
import { everyRecordCompleted, everyRecordInState, someRecordInState } from './common/util';

export module RecordPipelineProcessor {
  export async function setState(manager: EntityManager, pipeline: RecordPipeline, state: RECORD_PIPELINE_STATE): Promise<void> {
    pipeline.state = state;
    if (pipeline.state === RECORD_PIPELINE_STATE.IN_PROGRESS) {
      pipeline.inProgressAt = new Date();
    } else if (isRecordCompleted(pipeline.state)) {
      pipeline.completedAt = new Date();

      // await this.handleSendingSlackMessage(manager, pipeline, state);
    }

    await manager.getRepository(RecordPipeline).save(pipeline);
  }

  export function getNextStateFromInProgress(pipeline: RecordPipeline): RECORD_PIPELINE_STATE | null {
    const { recordPipelineId: pipelineId, state, recordDeviceJobs } = pipeline;
    const stateStr = RECORD_PIPELINE_STATE[state];
    if (state !== RECORD_PIPELINE_STATE.IN_PROGRESS) {
      throw new Error(`Pipeline [${pipelineId}] is in ${stateStr} state. can not exit.`);
    }
    if (!recordDeviceJobs || recordDeviceJobs.length === 0) {
      throw new Error(`Pipeline [${pipelineId}] has no job`);
    }

    if (!everyRecordCompleted(recordDeviceJobs)) {
      logger.info(`Pipeline [${pipelineId}] is not completed. waiting every job completed...`);
      return null;
    }

    const completeState = getCompleteStateFromRecordDeviceJobsState(pipeline, recordDeviceJobs);
    return completeState;
  }

  function getCompleteStateFromRecordDeviceJobsState(pipeline: RecordPipeline, recordDeviceJobs: RecordDeviceJob[]): RECORD_PIPELINE_STATE {
    const { recordPipelineId: pipelineId, state } = pipeline;
    if (everyRecordInState(recordDeviceJobs, RECORD_PIPELINE_STATE.SUCCESS)) {
      logger.info(`Pipeline [${pipelineId}] Every jobs are success.`);
      return RECORD_PIPELINE_STATE.SUCCESS;
    } else if (someRecordInState(recordDeviceJobs, RECORD_PIPELINE_STATE.FAILURE)) {
      logger.info(`Pipeline [${pipelineId}] Some jobs are failure.`);
      return RECORD_PIPELINE_STATE.FAILURE;
    } else if (someRecordInState(recordDeviceJobs, RECORD_PIPELINE_STATE.CANCELLED)) {
      logger.info(`Pipeline [${pipelineId}] Some jobs are cancelled.`);
      return RECORD_PIPELINE_STATE.CANCELLED;
    } else {
      if (state === RECORD_PIPELINE_STATE.CANCEL_REQUESTED) {
        return RECORD_PIPELINE_STATE.CANCELLED;
      }
      // unknown state
      const jobsStateStr = recordDeviceJobs
        .map((job) => {
          const stateStr = RECORD_PIPELINE_STATE[job.state];
          return `[${job.recordDeviceJobId}][${stateStr}]`;
        })
        .join(',');

      logger.error(`Pipeline [${pipelineId}] has unknown state device-job ${jobsStateStr}`);
      return RECORD_PIPELINE_STATE.FAILURE;
    }
  }

  export async function postProcess(manager: EntityManager, pipeline: RecordPipeline): Promise<boolean> {
    const { recordPipelineId, state, recordDeviceJobs } = pipeline;

    const stateStr = RECORD_PIPELINE_STATE[state];

    if (!isRecordCompleted(state)) {
      logger.error(`RecordPipeline [${recordPipelineId}] is in ${stateStr} state. can not postProcess.`);
      return false;
    }
    if (!recordDeviceJobs || recordDeviceJobs.length === 0) {
      logger.error(`RecordPipeline [${recordPipelineId}] has no device-job`);
      return false;
    }

    if (!everyRecordCompleted(recordDeviceJobs)) {
      logger.error(`Device-Jobs are not completed. RecordPipeline:${recordPipelineId}`);
      return false;
    }

    // check case
    const caseActions = recordDeviceJobs
      .map((recordDeviceJob) => recordDeviceJob.recordCaseActions)
      .flat()
      .filter(notEmpty);

    if (!caseActions || caseActions.length === 0) {
      logger.error(`Record-Case-Action are not found. RecordPipeline:${recordPipelineId}`);
      return false;
    }

    for (const caseAction of caseActions) {
      if (null === caseAction.completedAt || false === isRecordCompleted(caseAction.state)) {
        logger.warn(`CaseAction is unexpected state. RecordPipeline:${recordPipelineId}. StepAction:[${caseAction.recordCaseActionId}]`);
        await manager.getRepository(RecordCaseAction).update(caseAction.recordCaseActionId, { state: RECORD_PIPELINE_STATE.UNSPECIFIED });
      }
    }

    // check steps
    const stepActions = caseActions
      .map((caseAction) => caseAction.recordStepActions)
      .flat()
      .filter(notEmpty);
    if (!stepActions || stepActions.length === 0) {
      logger.error(`StepActions are not found. RecordPipeline:${recordPipelineId}`);
      return false;
    }

    for (const stepAction of stepActions) {
      if (null === stepAction.completedAt || false === isRecordCompleted(stepAction.state)) {
        logger.warn(`StepAction is unexpected state. RecordPipeline:${recordPipelineId}. StepAction:[${stepAction.recordCaseActionId}]`);
        await manager.getRepository(RecordStepAction).update(stepAction.recordTestStepId, { state: RECORD_PIPELINE_STATE.UNSPECIFIED });
      }
    }
    return true;
  }
}
