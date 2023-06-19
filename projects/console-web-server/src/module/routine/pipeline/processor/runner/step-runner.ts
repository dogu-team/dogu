import { isCompleted, PIPELINE_STATUS } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { RoutineStep } from '../../../../../db/entity/step.entity';
import { DoguLogger } from '../../../../logger/logger';
import { validateStatusTransition } from '../../../common/runner';

@Injectable()
export class StepRunner {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  public async update(step: RoutineStep, incomingStatus: PIPELINE_STATUS, localTimeStamp: Date): Promise<void> {
    const { routineStepId: stepId, name, status } = step;
    const stepStatusStr = PIPELINE_STATUS[status];
    const incomingStatusStr = PIPELINE_STATUS[incomingStatus];

    if (isCompleted(status)) {
      if (step.status === incomingStatus) {
        this.logger.info(`Step [${stepId}][${name}] is already completed. can not transition ${stepStatusStr} to ${incomingStatusStr} state.`);
      } else {
        this.logger.warn(`Step [${stepId}][${name}] is already completed. can not transition ${stepStatusStr} to ${incomingStatusStr} state.`);
      }
      return;
    }

    const isValid = validateStatusTransition(status, incomingStatus);
    if (!isValid) {
      this.logger.warn(`Step [${stepId}][${name}] is in ${stepStatusStr} state. can not transition to ${incomingStatusStr} state. something went wrong.`);
    }

    this.logger.info(`Step [${stepId}][${name}] is in ${stepStatusStr} state. transition to ${incomingStatusStr} state...`);
    await this.setStatus(this.dataSource.manager, step, incomingStatus, new Date(), localTimeStamp);
  }

  public async setStatus(manager: EntityManager, step: RoutineStep, incomingStatus: PIPELINE_STATUS, serverTimeStamp: Date, localTimeStamp: Date | null): Promise<void> {
    if (incomingStatus === PIPELINE_STATUS.IN_PROGRESS) {
      step.inProgressAt = serverTimeStamp;
      step.localInProgressAt = localTimeStamp;
    } else if (isCompleted(incomingStatus)) {
      step.completedAt = serverTimeStamp;
      step.localCompletedAt = localTimeStamp;
    }
    step.status = incomingStatus;
    await manager.getRepository(RoutineStep).save(step);
  }
}
