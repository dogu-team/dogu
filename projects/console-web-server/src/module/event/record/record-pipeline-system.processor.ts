import { Inject, Injectable } from '@nestjs/common';
import { RecordCaseActionUpdater } from './record-case-action-updater';
import { RecordDeviceJobUpdater } from './record-device-job-updater';
import { RecordPipelineUpdater } from './record-pipeline-updater';
import { RecordStepActionUpdater } from './record-step-action-updater';

@Injectable()
export class RecordPipelineSystemProcessor {
  constructor(
    @Inject(RecordPipelineUpdater)
    private readonly recordPipelineUpdater: RecordPipelineUpdater,
    @Inject(RecordDeviceJobUpdater)
    private readonly recordDeviceJobUpdater: RecordDeviceJobUpdater,
    @Inject(RecordCaseActionUpdater)
    private readonly recordCaseActionUpdater: RecordCaseActionUpdater,
    @Inject(RecordStepActionUpdater)
    private readonly recordStepActionUpdater: RecordStepActionUpdater,
  ) {}

  public async update(): Promise<void> {
    await this.recordPipelineUpdater.update();
    await this.recordDeviceJobUpdater.update();
    await this.recordCaseActionUpdater.update();
    await this.recordStepActionUpdater.update();
  }
}
