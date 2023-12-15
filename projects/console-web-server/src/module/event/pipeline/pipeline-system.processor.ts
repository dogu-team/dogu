import { Injectable } from '@nestjs/common';
import { DestUpdater } from './dest-updater';
import { ExternalEventUpdater } from './external-event-updater';
import { PipelineUpdater } from './pipeline-updater';
import { RoutineDeviceJobUpdater } from './routine-device-job-updater';
import { RoutineJobUpdater } from './routine-job-updater';
import { StepUpdater } from './step-updater';

@Injectable()
export class PipelineSystemProcessor {
  constructor(
    private readonly pipelineUpdater: PipelineUpdater,
    private readonly routineJobUpdater: RoutineJobUpdater,
    private readonly deviceJobUpdater: RoutineDeviceJobUpdater,
    private readonly stepUpdater: StepUpdater,
    private readonly destUpdater: DestUpdater,
    private readonly externalEventUpdater: ExternalEventUpdater,
  ) {}

  public async update(): Promise<void> {
    await this.pipelineUpdater.update();
    await this.routineJobUpdater.update();
    await this.deviceJobUpdater.update();
    await this.stepUpdater.update();
    await this.externalEventUpdater.update();
    await this.destUpdater.update();
  }
}
