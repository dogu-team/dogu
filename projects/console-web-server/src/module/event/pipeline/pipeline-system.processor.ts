import { Injectable } from '@nestjs/common';
import { DestUpdater } from './dest-updater';
import { ExternalEventUpdater } from './external-event-updater';
import { JobUpdater } from './job-updator';
import { PipelineUpdater } from './pipeline-updater';
import { RoutineDeviceJobUpdater } from './routine-device-job-updater';
import { StepUpdater } from './step-updater';

@Injectable()
export class PipelineSystemProcessor {
  constructor(
    private readonly pipelineUpdater: PipelineUpdater,
    private readonly jobUpdater: JobUpdater,
    private readonly deviceJobUpdater: RoutineDeviceJobUpdater,
    private readonly stepUpdater: StepUpdater,
    private readonly destUpdater: DestUpdater,
    private readonly externalEventUpdater: ExternalEventUpdater,
  ) {}

  public async update(): Promise<void> {
    await this.pipelineUpdater.update();
    await this.jobUpdater.update();
    await this.deviceJobUpdater.update();
    await this.stepUpdater.update();
    await this.externalEventUpdater.update();
    await this.destUpdater.update();
  }
}
