import { RecordCaseActionPropCamel, RecordStepActionPropCamel } from '@dogu-private/console';
import { PIPELINE_STATUS, RECORD_PIPELINE_STATE } from '@dogu-private/types';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RecordCaseAction } from '../../../db/entity/record-case-action.entity';
import { RecordStepActionProcessor } from '../../../enterprise/module/record/processor/record-step-action-processor';
import { DoguLogger } from '../../logger/logger';
import { RemoteWebDriverService } from '../../remote/remote-webdriver/remote-webdriver.service';

@Injectable()
export class RecordStepActionUpdater {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource, //
    @Inject(RemoteWebDriverService)
    private readonly remoteWebDriverService: RemoteWebDriverService,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    const functionsToCheck = [this.checkReadyToInprogressRecordStepAction.bind(this)];
    for (const checkFunction of functionsToCheck) {
      try {
        await checkFunction.call(this);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async checkReadyToInprogressRecordStepAction(): Promise<void> {
    const inprogressRecordCaseActions = await this.dataSource
      .getRepository(RecordCaseAction) //
      .createQueryBuilder('recordCaseAction')
      .innerJoinAndSelect(`recordCaseAction.${RecordCaseActionPropCamel.recordStepActions}`, 'recordStepAction')
      .innerJoinAndSelect(`recordStepAction.${RecordStepActionPropCamel.recordTestStep}`, 'recordStep')
      .where({ state: PIPELINE_STATUS.IN_PROGRESS })
      .getMany();

    if (inprogressRecordCaseActions.length === 0) {
      return;
    }

    for (const inprogressRecordCaseAction of inprogressRecordCaseActions) {
      const recordCaseActions = inprogressRecordCaseAction.recordStepActions ?? [];
      if (recordCaseActions.length === 0) {
        continue;
      }

      const readyToInprogressStep = RecordStepActionProcessor.getReadyToInprogressRecordStepAction(recordCaseActions);
      if (!readyToInprogressStep) {
        continue;
      }
      await RecordStepActionProcessor.setState(this.dataSource.manager, readyToInprogressStep, RECORD_PIPELINE_STATE.IN_PROGRESS, new Date());
      RecordStepActionProcessor.runAction(this.dataSource.manager, readyToInprogressStep, recordCaseActions, this.remoteWebDriverService);
    }
  }
}
