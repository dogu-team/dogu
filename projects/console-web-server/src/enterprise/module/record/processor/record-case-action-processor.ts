import { isRecordCompleted } from '@dogu-private/console';
import { RECORD_PIPELINE_STATE } from '@dogu-private/types';
import { EntityManager } from 'typeorm';
import { RecordCaseAction } from '../../../../db/entity/record-case-action.entity';
import { RecordStepAction } from '../../../../db/entity/record-step-action.entity';
import { logger } from '../../../../module/logger/logger.instance';
import { everyRecordCompleted, everyRecordInState, someRecordInState } from './common/util';

export module RecordCaseActionProcessor {
  export async function complete(manager: EntityManager, nextState: RECORD_PIPELINE_STATE, recordCaseAction: RecordCaseAction, serverTimeStamp: Date): Promise<void> {
    if (recordCaseAction.state !== RECORD_PIPELINE_STATE.IN_PROGRESS) {
      throw new Error(`RecordCaseAction [${recordCaseAction.recordCaseActionId}] is not in progress. can not complete.`);
    }

    if (nextState === RECORD_PIPELINE_STATE.SUCCESS) {
      await setState(manager, recordCaseAction, nextState, serverTimeStamp);
      return;
    }

    // skip remaining record-case-actions
    const recordDeviceJobId = recordCaseAction.recordDeviceJob!.recordDeviceJobId;
    const recordCaseActionGroup = await manager.getRepository(RecordCaseAction).find({ where: { recordDeviceJobId } });

    const curIdx = recordCaseAction.index;
    const skipCaseActions = recordCaseActionGroup.filter((recordCaseAction) => recordCaseAction.index > curIdx);

    for (const skipCaseAction of skipCaseActions) {
      await setState(manager, skipCaseAction, RECORD_PIPELINE_STATE.SKIPPED, new Date());
    }

    return;
  }

  export async function setState(manager: EntityManager, recordCaseAction: RecordCaseAction, updateState: RECORD_PIPELINE_STATE, serverTimeStamp: Date): Promise<void> {
    if (updateState === RECORD_PIPELINE_STATE.IN_PROGRESS) {
      recordCaseAction.inProgressAt = serverTimeStamp;
    } else if (isRecordCompleted(updateState)) {
      recordCaseAction.completedAt = serverTimeStamp;
    }
    recordCaseAction.state = updateState;
    await manager.getRepository(RecordCaseAction).save(recordCaseAction);
  }

  export function getReadyToInprogressRecordCaseAction(recordCaseActionsGroupByRecordDeviceJobId: RecordCaseAction[]): RecordCaseAction | null {
    const sortRecordAction = recordCaseActionsGroupByRecordDeviceJobId.sort((a, b) => {
      if (a.index < b.index) {
        return -1;
      }
      return 1;
    });
    const isInprogress = sortRecordAction.some((recordCaseAction) => recordCaseAction.state === RECORD_PIPELINE_STATE.IN_PROGRESS);
    if (isInprogress) {
      return null;
    }
    const isCompleted = sortRecordAction.every((recordCaseAction) => isRecordCompleted(recordCaseAction.state));
    if (isCompleted) {
      return null;
    }
    const readyToInprogress = sortRecordAction.find((recordCaseAction) => recordCaseAction.state === RECORD_PIPELINE_STATE.WAITING);
    if (!readyToInprogress) {
      throw new Error(
        `RecordCaseActionProcessor.getReadyToInprogressRecordCaseAction: readyToInprogress is null. recordCaseActionsGroupByRecordDeviceJobId: ${JSON.stringify(
          recordCaseActionsGroupByRecordDeviceJobId,
        )}`,
      );
    }
    return readyToInprogress;
  }

  export function getNextStateFromInProgress(recordCaseAction: RecordCaseAction): RECORD_PIPELINE_STATE | null {
    const { state, recordCaseActionId, recordStepActions, recordDeviceJob } = recordCaseAction;
    const stateStr = RECORD_PIPELINE_STATE[state];
    if (state !== RECORD_PIPELINE_STATE.IN_PROGRESS) {
      throw new Error(`RecordCaseAction [${recordCaseActionId}] is in ${stateStr} state. can not run getNextStateFromInProgress.`);
    }
    if (!recordStepActions || recordStepActions.length === 0) {
      return RECORD_PIPELINE_STATE.SUCCESS;
    }
    if (!recordDeviceJob) {
      throw new Error(`RecordCaseAction [${recordCaseActionId}] has no record-device-job.`);
    }

    if (recordDeviceJob.state === RECORD_PIPELINE_STATE.SKIPPED) {
      if (everyRecordInState(recordStepActions, RECORD_PIPELINE_STATE.WAITING)) {
        return RECORD_PIPELINE_STATE.SKIPPED;
      }
    }

    const recordStepActionInfos = recordStepActions.map((recordStepAction) => `${recordStepAction.recordStepActionId}`).toString();
    const isExitable = isCompletable(recordStepActions);
    if (!isExitable) {
      logger.info(
        `RecordCaseAction [${recordCaseActionId}] is waiting for record-step-actions to complete. Waiting every record-step-actions to complete. record-step-actions: ${recordStepActionInfos}`,
      );
      return null;
    }

    const completeState = getCompleteStateFromRecordStepActionState(recordCaseAction, recordStepActions);
    return completeState;
  }

  function isCompletable(recordStepActions: RecordStepAction[]): boolean {
    if (everyRecordCompleted(recordStepActions)) {
      return true;
    }
    return false;
  }

  function getCompleteStateFromRecordStepActionState(recordCaseAction: RecordCaseAction, recordStepActions: RecordStepAction[]): RECORD_PIPELINE_STATE {
    const { recordCaseActionId } = recordCaseAction;
    const recordStepActionInfos = recordStepActions.map((deviceJob) => `${deviceJob.recordCaseActionId}`).toString();
    if (everyRecordInState(recordStepActions, RECORD_PIPELINE_STATE.SUCCESS)) {
      logger.info(`RecordCaseAction [${recordCaseActionId}]. Every record-step-actions Success.`);
      return RECORD_PIPELINE_STATE.SUCCESS;
    } else if (someRecordInState(recordStepActions, RECORD_PIPELINE_STATE.FAILURE)) {
      logger.info(`RecordCaseAction [${recordCaseActionId}]. Some record-step-actions are failure. It will be failure. record-step-actions: ${recordStepActionInfos}`);
      return RECORD_PIPELINE_STATE.FAILURE;
    } else if (someRecordInState(recordStepActions, RECORD_PIPELINE_STATE.CANCELLED)) {
      logger.info(`RecordCaseAction [${recordCaseActionId}]. Some record-step-actions are cancelled. It will be cancelled. record-step-actions: ${recordStepActionInfos}`);
      return RECORD_PIPELINE_STATE.CANCELLED;
    } else if (everyRecordInState(recordStepActions, RECORD_PIPELINE_STATE.SKIPPED)) {
      logger.info(`RecordCaseAction [${recordCaseActionId}]. Some record-step-actions are skipped. It will be failure. record-step-actions: ${recordStepActionInfos}`);
      logger.info(`RecordCaseAction [${recordCaseActionId}] will be skipped.`);
      return RECORD_PIPELINE_STATE.SKIPPED;
    } else {
      // unknown state
      logger.error(`RecordCaseAction [${recordCaseActionId}]. Some record-step-actions are unknown state. record-step-actions: ${recordStepActionInfos}`);
      throw new Error(`RecordCaseAction [${recordCaseActionId}]. Some record-step-actions are unknown state. record-step-actions: ${recordStepActionInfos}`);
    }
  }
}
