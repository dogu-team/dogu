import { DEST_STATE, isCompleted, PIPELINE_STATUS } from '@dogu-private/types';
import { RoutineDeviceJob } from '../../../db/entity/device-job.entity';
import { RoutineJob } from '../../../db/entity/job.entity';
import { RoutinePipeline } from '../../../db/entity/pipeline.entity';
import { RoutineStep } from '../../../db/entity/step.entity';

type PipelineEntity = RoutineStep | RoutineDeviceJob | RoutineJob | RoutinePipeline;

export function everyCompleted(entities: PipelineEntity[]): boolean {
  return entities.every((entity) => isCompleted(entity.status));
}

export function everyInStatus(entities: PipelineEntity[], status: PIPELINE_STATUS): boolean {
  return entities.every((entity) => entity.status === status);
}

export function someInStatus(entities: PipelineEntity[], status: PIPELINE_STATUS): boolean {
  return entities.some((entity) => entity.status === status);
}

export function validateStatusTransition(curStatus: PIPELINE_STATUS, nextStatus: PIPELINE_STATUS): boolean {
  switch (curStatus) {
    case PIPELINE_STATUS.WAITING: {
      if (
        nextStatus === PIPELINE_STATUS.IN_PROGRESS || //
        nextStatus === PIPELINE_STATUS.SKIPPED
      ) {
        return true;
      }
      return false;
    }
    case PIPELINE_STATUS.IN_PROGRESS: {
      if (
        nextStatus === PIPELINE_STATUS.SUCCESS || //
        nextStatus === PIPELINE_STATUS.FAILURE ||
        nextStatus === PIPELINE_STATUS.CANCELLED
      ) {
        return true;
      }
      return false;
    }
    case PIPELINE_STATUS.CANCEL_REQUESTED: {
      if (
        nextStatus === PIPELINE_STATUS.CANCELLED || //
        nextStatus === PIPELINE_STATUS.SUCCESS ||
        nextStatus === PIPELINE_STATUS.FAILURE
      ) {
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}

export function validateDestStateTransition(curStatus: DEST_STATE, nextStatus: DEST_STATE): boolean {
  switch (curStatus) {
    case DEST_STATE.PENDING: {
      if (nextStatus === DEST_STATE.RUNNING || nextStatus === DEST_STATE.SKIPPED) {
        return true;
      }
      return false;
    }
    case DEST_STATE.RUNNING: {
      if (nextStatus === DEST_STATE.PASSED || nextStatus === DEST_STATE.FAILED) {
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}
