import { Inject, Injectable } from '@nestjs/common';
import { DestUpdater } from './dest-updater';
import { DeviceJobUpdater } from './device-job-updater';
import { ExternalEventUpdater } from './external-event-updater';
import { JobUpdater } from './job-updator';
import { PipelineUpdater } from './pipeline-updater';
import { StepUpdater } from './step-updater';

@Injectable()
export class PipelineSystemProcessor {
  constructor(
    @Inject(PipelineUpdater) private readonly pipelineUpdater: PipelineUpdater,
    @Inject(JobUpdater) private readonly jobUpdater: JobUpdater,
    @Inject(DeviceJobUpdater) private readonly deviceJobUpdater: DeviceJobUpdater,
    @Inject(StepUpdater) private readonly stepUpdater: StepUpdater,
    @Inject(DestUpdater) private readonly destUpdater: DestUpdater,
    @Inject(ExternalEventUpdater) private readonly externalEventUpdater: ExternalEventUpdater,
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
