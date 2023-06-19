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

// export async function setStatus(manager: EntityManager, entity: PipelineEntity, state: PIPELINE_STATUS, localTimeStamp: Date = new Date()): Promise<void> {
//   entity.status = state;
//   if (entity.status === PIPELINE_STATUS.IN_PROGRESS) {
//     entity.inProgressAt = localTimeStamp;
//     if (entity instanceof RoutineDeviceJob) {
//       entity.heartbeat = localTimeStamp;
//     }
//   } else if (isCompleted(entity.status)) {
//     entity.completedAt = localTimeStamp;
//   }

//   await manager.getRepository(entity.constructor.name).save(entity);
// }

// export async function setDestState(manager: EntityManager, entity: DestBase, status: DEST_STATE, serverTimeStamp: Date, localTimeStamp: Date | null): Promise<void> {
//   entity.state = status;
//   if (status === DEST_STATE.RUNNING) {
//     entity.localInProgressAt = localTimeStamp;
//     entity.inProgressAt = serverTimeStamp;
//   } else if (isDestCompleted(status)) {
//     entity.completedAt = serverTimeStamp;
//     entity.localCompletedAt = localTimeStamp;
//   }

//   await manager.getRepository(entity.constructor.name).save(entity);
// }

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

// export function checkEntitiesCondition(
//   entities: PipelineEntity[], //
//   conditions: { isEvery: boolean; condition: (entity: PipelineEntity) => boolean }[],
// ): boolean[] {
//   const result: boolean[] = [];
//   result.fill(false, 0, conditions.length);
// }
// const results = checkEntitiesCondition(
//   [new Pipeline(), new Pipeline()],
//   [
//     { isEvery: true, condition: (e) => e.status === PIPELINE_STATUS.IN_PROGRESS },
//     { isEvery: false, condition: (e) => e.status === PIPELINE_STATUS.FAILURE },
//     { isEvery: false, condition: (e) => e.status === PIPELINE_STATUS.CANCELLED },
//   ],
// );
