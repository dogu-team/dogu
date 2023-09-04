import { RecordCaseActionPropCamel, RecordDeviceJobPropCamel } from '@dogu-private/console';
import { PIPELINE_STATUS, RECORD_PIPELINE_STATE } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull, Not } from 'typeorm';
import { RecordCaseAction } from '../../../db/entity/record-case-action.entity';
import { RecordDeviceJob } from '../../../db/entity/record-device-job.entity';
import { RecordCaseActionProcessor } from '../../../enterprise/module/record/processor/record-case-action-processor';
import { DoguLogger } from '../../logger/logger';

@Injectable()
export class RecordCaseActionUpdater {
  constructor(@InjectDataSource() private readonly dataSource: DataSource, private readonly logger: DoguLogger) {}

  public async update(): Promise<void> {
    const functionsToCheck = [
      this.checkReadyToInprogressRecordCaseAction.bind(this), //
      this.checkInprogressRecordCaseAction.bind(this),
    ];
    for (const checkFunction of functionsToCheck) {
      try {
        await checkFunction.call(this);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async checkReadyToInprogressRecordCaseAction(): Promise<void> {
    const inProgressJobs = await this.dataSource
      .getRepository(RecordDeviceJob) //
      .createQueryBuilder('recordDeviceJob')
      .innerJoinAndSelect(`recordDeviceJob.${RecordDeviceJobPropCamel.recordCaseActions}`, 'recordCaseAction')
      .where({ state: RECORD_PIPELINE_STATE.IN_PROGRESS })
      .andWhere({ sessionId: Not(IsNull()) })
      .getMany();

    if (inProgressJobs.length === 0) {
      return;
    }

    for (const inprogressJob of inProgressJobs) {
      const recordCaseActions = inprogressJob.recordCaseActions ?? [];
      if (recordCaseActions.length === 0) {
        continue;
      }

      const readyToInprogressCase = RecordCaseActionProcessor.getReadyToInprogressRecordCaseAction(recordCaseActions);
      if (!readyToInprogressCase) {
        continue;
      }
      await RecordCaseActionProcessor.setState(this.dataSource.manager, readyToInprogressCase, RECORD_PIPELINE_STATE.IN_PROGRESS, new Date());
    }
  }

  private async checkInprogressRecordCaseAction(): Promise<void> {
    const inprogressRecordCaseActions = await this.dataSource
      .getRepository(RecordCaseAction) //
      .createQueryBuilder('recordCaseAction')
      .innerJoinAndSelect(`recordCaseAction.${RecordCaseActionPropCamel.recordStepActions}`, 'recordStepAction')
      .innerJoinAndSelect(`recordCaseAction.${RecordCaseActionPropCamel.recordDeviceJob}`, 'recordDeviceJob')
      .where({ state: PIPELINE_STATUS.IN_PROGRESS })
      .getMany();

    if (inprogressRecordCaseActions.length === 0) {
      return;
    }

    for (const recordCaseAction of inprogressRecordCaseActions) {
      const nextState = RecordCaseActionProcessor.getNextStateFromInProgress(recordCaseAction);
      if (nextState === null) {
        continue;
      }

      await RecordCaseActionProcessor.complete(this.dataSource.manager, nextState, recordCaseAction, new Date());
    }
  }
}
