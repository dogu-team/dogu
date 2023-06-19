import { RoutineDeviceJobPropCamel, RoutineDeviceJobPropSnake, RoutineStepPropCamel } from '@dogu-private/console';
import { stringify } from '@dogu-tech/common';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Dest } from '../../../db/entity';
import { RoutineDeviceJob } from '../../../db/entity/device-job.entity';
import { RoutineStep } from '../../../db/entity/step.entity';
import { DoguLogger } from '../../logger/logger';
import { DestRunner } from '../../routine/pipeline/processor/runner/dest-runner';
import { DeviceJobRunner } from '../../routine/pipeline/processor/runner/device-job-runner';
import { PipelineRunner } from '../../routine/pipeline/processor/runner/pipeline-runner';
import { StepRunner } from '../../routine/pipeline/processor/runner/step-runner';
import {
  CancelPipelineEvent,
  CanclePipelineQueue,
  UpdateDestStateEvent,
  UpdateDestStateQueue,
  UpdateDeviceJobStatusEvent,
  UpdateDeviceJobStatusQueue,
  UpdateStepStatusEvent,
  UpdateStepStatusQueue,
} from './update-pipeline-queue';

@Injectable()
export class ExternalEventUpdater {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @Inject(PipelineRunner)
    private readonly pipelineRunner: PipelineRunner,
    @Inject(StepRunner)
    private readonly stepRunner: StepRunner,
    @Inject(DestRunner)
    private readonly destRunner: DestRunner,
    @Inject(DeviceJobRunner)
    private readonly deviceJobRunner: DeviceJobRunner,

    @Inject(CanclePipelineQueue)
    private readonly canclePipelineQueue: CanclePipelineQueue,
    @Inject(UpdateDeviceJobStatusQueue)
    private readonly updateDeviceJobStatusQueue: UpdateDeviceJobStatusQueue,
    @Inject(UpdateStepStatusQueue)
    private readonly updateStepStatusQueue: UpdateStepStatusQueue,
    @Inject(UpdateDestStateQueue)
    private readonly updateDestStateQueue: UpdateDestStateQueue,

    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    const functionsToCheck = [
      this.consumeCancelPipelineQueue.bind(this), //
      this.consumeUpdateDestStateQueue.bind(this),
      this.consumeUpdateStepStatusQueue.bind(this),
      this.consumeUpdateDeviceJobStatusQueue.bind(this),
    ];

    for (const checkFunction of functionsToCheck) {
      try {
        await checkFunction.call(this);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async consumeCancelPipelineQueue(): Promise<void> {
    const cancelPipelineEvents = this.canclePipelineQueue.drain();
    if (cancelPipelineEvents.length === 0) {
      return;
    }
    // await Promise.all(cancelPipelineEvents.map((event) => this.handeCancelPipelineEvent(event)));

    for (const event of cancelPipelineEvents) {
      this.logger.info('consumeCancelPipelineQueue. Evnet: ', { event });
      await this.handeCancelPipelineEvent(event);
    }
  }

  private async consumeUpdateDeviceJobStatusQueue(): Promise<void> {
    const updateDeviceJobStatusEvents = this.updateDeviceJobStatusQueue.drain();
    if (updateDeviceJobStatusEvents.length === 0) {
      return;
    }
    // await Promise.all(updateDeviceJobStatusEvents.map((event) => this.handlelUpdateDeviceJobStatusEvent(event)));

    for (const event of updateDeviceJobStatusEvents) {
      this.logger.info('consumeUpdateDeviceJobStatusQueue. Evnet: ', { event });
      await this.handlelUpdateDeviceJobStatusEvent(event);
    }
  }

  private async consumeUpdateStepStatusQueue(): Promise<void> {
    const updateStepStatusEvents = this.updateStepStatusQueue.drain();
    if (updateStepStatusEvents.length === 0) {
      return;
    }

    // await Promise.all(updateStepStatusEvents.map((event) => this.handelUpdateStepStatusEvent(event)));

    for (const event of updateStepStatusEvents) {
      this.logger.info('consumeUpdateStepStatusQueue. Evnet: ', { event });
      await this.handelUpdateStepStatusEvent(event);
    }
  }

  private async consumeUpdateDestStateQueue(): Promise<void> {
    const updateDestStateEvents = this.updateDestStateQueue.drain();
    if (updateDestStateEvents.length === 0) {
      return;
    }

    // await Promise.all(updateDestStateEvents.map((event) => this.handeUpdateDestStateEvent(event)));

    for (const event of updateDestStateEvents) {
      this.logger.info('consumeUpdateDestStateQueue. Evnet: ', { event });
      await this.handeUpdateDestStateEvent(event);
    }
  }

  private async handelUpdateStepStatusEvent(event: UpdateStepStatusEvent): Promise<void> {
    const step = await this.dataSource.getRepository(RoutineStep).findOne({ where: { routineStepId: event.stepId } });
    if (!step) {
      this.logger.error(`stepId ${event.stepId} is not found. EventInfo: ${stringify(event)}`);
      return;
    }
    await this.stepRunner.update(step, event.updateStepStatusRequestBody.status, event.updateStepStatusRequestBody.localTimeStamp);
  }

  private async handlelUpdateDeviceJobStatusEvent(event: UpdateDeviceJobStatusEvent): Promise<void> {
    const deviceJob = await this.dataSource
      .getRepository(RoutineDeviceJob) //
      .createQueryBuilder('deviceJob')
      .innerJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineSteps}`, 'step')
      .leftJoinAndSelect(`step.${RoutineStepPropCamel.dests}`, 'dest')
      .where(`deviceJob.${RoutineDeviceJobPropSnake.routine_device_job_id} = :deviceJobId`, { deviceJobId: event.deviceJobId })
      .getOne();
    if (!deviceJob) {
      this.logger.error(`deviceJobId ${event.deviceJobId} is not found. EventInfo: ${stringify(event)}`);
      return;
    }
    await this.deviceJobRunner.complete(deviceJob, event.updateDeviceJobStatusRequestBody);
  }

  private async handeCancelPipelineEvent(event: CancelPipelineEvent): Promise<void> {
    this.logger.info('handeCancelPipelineEvent. Evnet: ', { event });
    await this.pipelineRunner.cancelPipeline(event.projectId, event.pipelineId, event.userId);
  }

  private async handeUpdateDestStateEvent(event: UpdateDestStateEvent): Promise<void> {
    const { destStatus, localTimeStamp } = event.updateDestStatusRequestBody;
    const dest = await this.dataSource.getRepository(Dest).findOne({ where: { destId: event.destId } });
    if (!dest) {
      this.logger.error(`destId ${event.destId} is not found. EventInfo: ${stringify(event)}`);
      return;
    }
    await this.destRunner.update(dest, destStatus, localTimeStamp);
  }
}
