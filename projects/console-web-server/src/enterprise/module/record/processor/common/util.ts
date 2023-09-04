import { isRecordCompleted } from '@dogu-private/console';
import { RECORD_PIPELINE_STATE } from '@dogu-private/types';
import { RecordCaseAction } from '../../../../../db/entity/record-case-action.entity';
import { RecordDeviceJob } from '../../../../../db/entity/record-device-job.entity';
import { RecordPipeline } from '../../../../../db/entity/record-pipeline.entity';
import { RecordStepAction } from '../../../../../db/entity/record-step-action.entity';

type PipelineEntity = RecordStepAction | RecordCaseAction | RecordDeviceJob | RecordPipeline;

export function everyRecordCompleted(entities: PipelineEntity[]): boolean {
  return entities.every((entity) => isRecordCompleted(entity.state));
}

export function everyRecordInState(entities: PipelineEntity[], state: RECORD_PIPELINE_STATE): boolean {
  return entities.every((entity) => entity.state === state);
}

export function someRecordInState(entities: PipelineEntity[], state: RECORD_PIPELINE_STATE): boolean {
  return entities.some((entity) => entity.state === state);
}

export function validateRecordStateTransition(curState: RECORD_PIPELINE_STATE, nextState: RECORD_PIPELINE_STATE): boolean {
  switch (curState) {
    case RECORD_PIPELINE_STATE.WAITING: {
      if (
        nextState === RECORD_PIPELINE_STATE.IN_PROGRESS || //
        nextState === RECORD_PIPELINE_STATE.SKIPPED
      ) {
        return true;
      }
      return false;
    }
    case RECORD_PIPELINE_STATE.IN_PROGRESS: {
      if (
        nextState === RECORD_PIPELINE_STATE.SUCCESS || //
        nextState === RECORD_PIPELINE_STATE.FAILURE ||
        nextState === RECORD_PIPELINE_STATE.CANCELLED
      ) {
        return true;
      }
      return false;
    }
    case RECORD_PIPELINE_STATE.CANCEL_REQUESTED: {
      if (
        nextState === RECORD_PIPELINE_STATE.CANCELLED || //
        nextState === RECORD_PIPELINE_STATE.SUCCESS ||
        nextState === RECORD_PIPELINE_STATE.FAILURE
      ) {
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}
