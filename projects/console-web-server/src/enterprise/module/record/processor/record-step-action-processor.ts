import { isRecordCompleted, RecordCaseActionPropCamel, RecordDeviceJobPropCamel } from '@dogu-private/console';
import { RECORD_PIPELINE_STATE, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { EntityManager } from 'typeorm';
import { RecordCaseAction } from '../../../../db/entity/record-case-action.entity';
import { RecordDeviceJob } from '../../../../db/entity/record-device-job.entity';
import { RecordStepAction } from '../../../../db/entity/record-step-action.entity';
import { RemoteWebDriverBatchRequestExecutor } from '../../../../module/remote/remote-webdriver/remote-webdriver.batch-request-executor';
import { RemoteWebDriverService } from '../../../../module/remote/remote-webdriver/remote-webdriver.service';
import {
  W3CElementClickRemoteWebDriverBatchRequestItem,
  W3CFindElementRemoteWebDriverBatchRequestItem,
} from '../../../../module/remote/remote-webdriver/remote-webdriver.w3c-batch-request-items';
import { makeActionBatchExcutor } from '../common';

export module RecordStepActionProcessor {
  export async function setState(manager: EntityManager, recordStepAction: RecordStepAction, updateState: RECORD_PIPELINE_STATE, serverTimeStamp: Date): Promise<void> {
    if (updateState === RECORD_PIPELINE_STATE.IN_PROGRESS) {
      recordStepAction.inProgressAt = serverTimeStamp;
    } else if (isRecordCompleted(updateState)) {
      recordStepAction.completedAt = serverTimeStamp;
    }
    recordStepAction.state = updateState;
    await manager.getRepository(RecordStepAction).save(recordStepAction);
  }

  export function getReadyToInprogressRecordStepAction(recordStepActionsGroupByRecordDeviceJobId: RecordStepAction[]): RecordStepAction | null {
    const sortRecordAction = recordStepActionsGroupByRecordDeviceJobId.sort((a, b) => {
      if (a.index < b.index) {
        return -1;
      }
      return 1;
    });
    const isInprogress = sortRecordAction.some((recordStepAction) => recordStepAction.state === RECORD_PIPELINE_STATE.IN_PROGRESS);
    if (isInprogress) {
      return null;
    }
    const isCompleted = sortRecordAction.every((recordStepAction) => isRecordCompleted(recordStepAction.state));
    if (isCompleted) {
      return null;
    }
    const readyToInprogress = sortRecordAction.find((recordStepAction) => recordStepAction.state === RECORD_PIPELINE_STATE.WAITING);
    if (!readyToInprogress) {
      throw new Error(
        `RecordStepActionProcessor.getReadyToInprogressRecordStepAction: readyToInprogress is null. recordStepActionsGroupByRecordDeviceJobId: ${JSON.stringify(
          recordStepActionsGroupByRecordDeviceJobId,
        )}`,
      );
    }
    return readyToInprogress;
  }

  export async function runAction(
    manager: EntityManager,
    recordStepAction: RecordStepAction,
    recordStepGroup: RecordStepAction[],
    remoteWebDriverService: RemoteWebDriverService,
  ): Promise<void> {
    if (recordStepAction.state !== RECORD_PIPELINE_STATE.IN_PROGRESS) {
      throw new Error(`RecordStepAction [${recordStepAction.recordStepActionId}] is not in WAITING state. can not run runAction.`);
    }
    const { type } = recordStepAction;

    await manager.transaction(async (trManager) => {
      const recordCaseAction = await manager
        .getRepository(RecordCaseAction)
        .createQueryBuilder('recordCaseAction')
        .innerJoinAndSelect(`recordCaseAction.${RecordCaseActionPropCamel.recordDeviceJob}`, 'recordDeviceJob')
        .innerJoinAndSelect(`recordDeviceJob.${RecordDeviceJobPropCamel.device}`, 'device')
        .innerJoinAndSelect(`recordDeviceJob.${RecordDeviceJobPropCamel.recordPipeline}`, 'recordPipeline')
        .where({ recordCaseActionId: recordStepAction.recordCaseActionId })
        .getOne();

      const recordDeviceJob = recordCaseAction!.recordDeviceJob!;
      const projectId = recordDeviceJob.recordPipeline!.projectId;
      const device = recordDeviceJob.device!;

      // run action
      const batchExecutor: RemoteWebDriverBatchRequestExecutor = makeActionBatchExcutor(
        remoteWebDriverService,
        projectId,
        recordDeviceJob.sessionId!,
        recordDeviceJob.recordDeviceJobId,
        device,
      );

      switch (type) {
        case RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_CLICK: {
          try {
            await runClickAction(recordStepAction, recordDeviceJob, batchExecutor);
            await setState(trManager, recordStepAction, RECORD_PIPELINE_STATE.SUCCESS, new Date());
          } catch (err) {
            await handleRunActionFailure(trManager, recordStepAction, recordStepGroup);
          }
          break;
        }
        case RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_INPUT:
          throw new Error('not implemented');
        case RECORD_TEST_STEP_ACTION_TYPE.UNSPECIFIED:
          throw new Error(`RecordStepActionProcessor.runAction: type is UNSPECIFIED. recordStepAction: ${JSON.stringify(recordStepAction)}`);
        default:
          const _exhaustiveCheck: never = type;
          throw new Error(`RecordStepActionProcessor.runAction: type is not valid. recordStepAction: ${JSON.stringify(recordStepAction)}`);
      }
    });
  }

  async function handleRunActionFailure(manager: EntityManager, recordStepAction: RecordStepAction, recordStepGroup: RecordStepAction[]) {
    await setState(manager, recordStepAction, RECORD_PIPELINE_STATE.FAILURE, new Date());

    const curIdx = recordStepAction.index;
    const skipStepActions = recordStepGroup.filter((recordStepAction) => recordStepAction.index > curIdx);

    for (const recordStepAction of skipStepActions) {
      await setState(manager, recordStepAction, RECORD_PIPELINE_STATE.SKIPPED, new Date());
    }
  }

  async function runClickAction(recordStepAction: RecordStepAction, recordDeviceJob: RecordDeviceJob, batchExecutor: RemoteWebDriverBatchRequestExecutor): Promise<void> {
    const findElExecutor = batchExecutor.new({ parallel: false });
    const findElement = new W3CFindElementRemoteWebDriverBatchRequestItem(findElExecutor, recordDeviceJob.sessionId!, 'xpath', recordStepAction.recordTestStep!.xpath!);
    await findElExecutor.execute();
    const elId = await findElement.response();
    const clickExecutor = batchExecutor.new({ parallel: false });
    const click = new W3CElementClickRemoteWebDriverBatchRequestItem(clickExecutor, recordDeviceJob.sessionId!, elId);
    await clickExecutor.execute();
    await click.response();
  }
}
