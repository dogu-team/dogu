import { isRecordCompleted } from '@dogu-private/console';
import { RECORD_PIPELINE_STATE } from '@dogu-private/types';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DeviceRunner } from '../../../../db/entity/device-runner.entity';
import { RecordCaseAction } from '../../../../db/entity/record-case-action.entity';
import { RecordDeviceJob } from '../../../../db/entity/record-device-job.entity';
import { RecordStepAction } from '../../../../db/entity/record-step-action.entity';
import { logger } from '../../../../module/logger/logger.instance';
import { ApplicationService } from '../../../../module/project/application/application.service';
import { RemoteWebDriverService } from '../../../../module/remote/remote-webdriver/remote-webdriver.service';
import { newWebDriverSession } from '../common';
import { everyRecordCompleted, everyRecordInState, someRecordInState } from './common/util';

export module RecordDeviceJobProcessor {
  export async function complete(manager: EntityManager, nextState: RECORD_PIPELINE_STATE, recordDeviceJob: RecordDeviceJob, serverTimeStamp: Date): Promise<void> {
    if (recordDeviceJob.state !== RECORD_PIPELINE_STATE.IN_PROGRESS) {
      throw new Error(`RecordDeviceJob [${recordDeviceJob.recordDeviceJobId}] is not in progress. can not complete.`);
    }
    if (!recordDeviceJob.deviceRunnerId) {
      throw new Error(`RecordDeviceJob [${recordDeviceJob.recordDeviceJobId}] has no deviceRunnerId.`);
    }

    await setState(manager, recordDeviceJob, nextState, serverTimeStamp);
    await manager.getRepository(DeviceRunner).update(recordDeviceJob.deviceRunnerId!, { isInUse: 0 });
    return;
  }

  export async function setState(manager: EntityManager, recordDeviceJob: RecordDeviceJob, updateState: RECORD_PIPELINE_STATE, serverTimeStamp: Date): Promise<void> {
    if (updateState === RECORD_PIPELINE_STATE.IN_PROGRESS) {
      recordDeviceJob.inProgressAt = serverTimeStamp;
    } else if (isRecordCompleted(updateState)) {
      await manager.getRepository(DeviceRunner).update(recordDeviceJob.deviceRunnerId!, { isInUse: 0 });
      recordDeviceJob.completedAt = serverTimeStamp;
    }
    recordDeviceJob.state = updateState;
    await manager.getRepository(RecordDeviceJob).save(recordDeviceJob);
  }

  export function getNextStateFromInProgress(recordDeviceJob: RecordDeviceJob): RECORD_PIPELINE_STATE | null {
    const { state, recordDeviceJobId, recordCaseActions, recordPipelineId, recordPipeline } = recordDeviceJob;
    const stateStr = RECORD_PIPELINE_STATE[state];
    if (state !== RECORD_PIPELINE_STATE.IN_PROGRESS) {
      throw new Error(`RecordDeviceJob [${recordDeviceJobId}] is in ${stateStr} state. can not run getNextStatusFromInProgress.`);
    }
    if (!recordCaseActions || recordCaseActions.length === 0) {
      throw new Error(`RecordDeviceJob [${recordDeviceJobId}] has no device running RecordDeviceJobs.`);
    }
    if (!recordPipeline) {
      throw new Error(`RecordDeviceJob [${recordDeviceJobId}] has no pipeline.`);
    }

    if (recordPipeline.state === RECORD_PIPELINE_STATE.CANCEL_REQUESTED) {
      if (everyRecordInState(recordCaseActions, RECORD_PIPELINE_STATE.WAITING)) {
        return RECORD_PIPELINE_STATE.SKIPPED;
      }
    }

    const recordCaseActionInfos = recordCaseActions.map((recordCaseAction) => `${recordCaseAction.recordCaseActionId}`).toString();
    const isExitable = isCompletable(recordCaseActions);
    if (!isExitable) {
      logger.info(
        `RecordDeviceJob [${recordDeviceJobId}] is waiting for record-case-actions to complete. Waiting every record-case-actions to complete.  record-case-actions: ${recordCaseActionInfos}`,
      );
      return null;
    }

    const completeState = getCompleteStateFromRecordCaseActionState(recordDeviceJob, recordCaseActions);
    return completeState;
  }

  function isCompletable(deviceCaseActions: RecordCaseAction[]): boolean {
    if (everyRecordCompleted(deviceCaseActions)) {
      return true;
    }
    return false;
  }

  function getCompleteStateFromRecordCaseActionState(recordDeviceJob: RecordDeviceJob, recordCaseActions: RecordCaseAction[]): RECORD_PIPELINE_STATE {
    const { recordDeviceJobId } = recordDeviceJob;
    const recordCaseActionInfos = recordCaseActions.map((deviceJob) => `${deviceJob.recordCaseActionId}`).toString();
    if (everyRecordInState(recordCaseActions, RECORD_PIPELINE_STATE.SUCCESS)) {
      logger.info(`RecordDeviceJob [${recordDeviceJobId}]. Every record-case-actions Success.`);
      return RECORD_PIPELINE_STATE.SUCCESS;
    } else if (someRecordInState(recordCaseActions, RECORD_PIPELINE_STATE.FAILURE)) {
      logger.info(`RecordDeviceJob [${recordDeviceJobId}]. Some record-case-actions are failure. It will be failure. record-case-actions: ${recordCaseActionInfos}`);
      return RECORD_PIPELINE_STATE.FAILURE;
    } else if (someRecordInState(recordCaseActions, RECORD_PIPELINE_STATE.CANCELLED)) {
      logger.info(`RecordDeviceJob [${recordDeviceJobId}]. Some record-case-actions are cancelled. It will be cancelled. record-case-actions: ${recordCaseActionInfos}`);
      return RECORD_PIPELINE_STATE.CANCELLED;
    } else if (everyRecordInState(recordCaseActions, RECORD_PIPELINE_STATE.SKIPPED)) {
      logger.info(`RecordDeviceJob [${recordDeviceJobId}]. Some record-case-actions are skipped. It will be failure. record-case-actions: ${recordCaseActionInfos}`);
      logger.info(`RecordDeviceJob [${recordDeviceJobId}] will be skipped.`);
      return RECORD_PIPELINE_STATE.SKIPPED;
    } else {
      // unknown state
      logger.error(`RecordDeviceJob [${recordDeviceJobId}]. Some record-case-actions are unknown state. record-case-actions: ${recordCaseActionInfos}`);
      throw new Error(`RecordDeviceJob [${recordDeviceJobId}]. Some record-case-actions are unknown state. record-case-actions: ${recordCaseActionInfos}`);
    }
  }

  export async function initApp(manager: EntityManager, recordDeviceJob: RecordDeviceJob, applicationService: ApplicationService, remoteWebDriverService: RemoteWebDriverService) {
    await manager.transaction(async (trManager) => {
      try {
        await newSession(trManager, recordDeviceJob, applicationService, remoteWebDriverService);
      } catch (err) {
        logger.error(`RecordDeviceJobProcessor.runProgram. newSession error. ${err}`);
        await handleNewSessionFailure(trManager, recordDeviceJob);
        return;
      }
    });
  }

  async function handleNewSessionFailure(manager: EntityManager, recordDeviceJob: RecordDeviceJob) {
    await setState(manager, recordDeviceJob, RECORD_PIPELINE_STATE.FAILURE, new Date());
    await manager.getRepository(DeviceRunner).update(recordDeviceJob.deviceRunnerId!, { isInUse: 0 });

    const recordCaseActions = recordDeviceJob.recordCaseActions!;
    const recordActionCaseIds = recordCaseActions.map((recordActionCase) => recordActionCase.recordCaseActionId);

    const recordActionSteps = recordCaseActions.map((recordCaseAction) => recordCaseAction.recordStepActions!).flat();
    const recordActionStepIds = recordActionSteps.map((recordActionStep) => recordActionStep.recordStepActionId);

    await manager.getRepository(RecordCaseAction).update(recordActionCaseIds, { state: RECORD_PIPELINE_STATE.SKIPPED, completedAt: new Date() });
    await manager.getRepository(RecordStepAction).update(recordActionStepIds, { state: RECORD_PIPELINE_STATE.SKIPPED, completedAt: new Date() });
  }

  async function newSession(manager: EntityManager, recordDeviceJob: RecordDeviceJob, applicationService: ApplicationService, remoteWebDriverService: RemoteWebDriverService) {
    const { device, deviceId } = recordDeviceJob;
    if (!device) {
      throw new HttpException(`Device not found. deviceId: ${deviceId}`, HttpStatus.NOT_FOUND);
    }

    const recordActionCase = recordDeviceJob.recordCaseActions![0];
    const { projectId, browserName, packageName } = recordActionCase.recordTestCase!;

    const newSessionResponse = await newWebDriverSession(
      manager,
      applicationService,
      remoteWebDriverService,
      device,
      projectId,
      recordDeviceJob.recordDeviceJobId,
      browserName,
      packageName,
    );
    const res = await newSessionResponse.response();
    await manager.getRepository(RecordDeviceJob).update(recordDeviceJob.recordDeviceJobId, { sessionId: res.value.sessionId });
  }
}
