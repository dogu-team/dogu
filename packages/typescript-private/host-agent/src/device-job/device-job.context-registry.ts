import { StepStatusInfo } from '@dogu-private/console-host-agent';
import { OrganizationId, PIPELINE_STATUS, RoutineDeviceJobId, Serial } from '@dogu-private/types';
import { Closable, errorify, Instance, validateAndEmitEventAsync } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { setTimeout } from 'timers';
import { OnDeviceDisconnectedEvent } from '../device/device.events';
import { OnHostDisconnectedEvent } from '../host/host.events';
import { DoguLogger } from '../logger/logger';
import { MessageCanceler, MessagePostProcessor } from '../message/message.types';
import { OnStepCompletedEvent, OnStepInProgressEvent } from '../step/step.events';
import { OnDeviceJobCancelRequestedEvent, OnDeviceJobCompletedEvent, OnDeviceJobPostProcessCompletedEvent, OnDeviceJobStartedEvent } from './device-job.events';

interface DeviceJobContext {
  serial: Serial;
  organizationId: OrganizationId;
  routineDeviceJobId: RoutineDeviceJobId;
  canceler: MessageCanceler | null;
  stepStatusInfos: StepStatusInfo[];
  postProcessors: MessagePostProcessor[];
  cancelRequested: boolean;
}

class DeviceJobContextCloser implements Closable {
  private closer: Closable | null;

  constructor(closer: Closable) {
    this.closer = closer;
  }

  close(): void {
    if (!this.closer) {
      return;
    }
    const closer = this.closer;
    this.closer = null;
    closer.close();
  }
}

interface DeviceJobProcessResult {
  stepStatusInfos: StepStatusInfo[];
  contextCloser: DeviceJobContextCloser;
}

@Injectable()
export class DeviceJobContextRegistry {
  private readonly _contexts = new Map<string, DeviceJobContext>();
  get contexts(): ReadonlyMap<string, DeviceJobContext> {
    return this._contexts;
  }

  constructor(
    private readonly logger: DoguLogger,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(OnHostDisconnectedEvent.key)
  async onHostDisconnected(value: Instance<typeof OnHostDisconnectedEvent.value>): Promise<void> {
    for (const [key, context] of this._contexts) {
      try {
        const { organizationId, routineDeviceJobId } = context;
        const { contextCloser } = await this.process(organizationId, routineDeviceJobId);
        contextCloser.close();
      } catch (error) {
        this.logger.error(`DeviceJobContextRegistry: error while processing deviceJob: ${key}`, { error });
      }
    }
  }

  @OnEvent(OnDeviceDisconnectedEvent.key)
  async onDeviceDisconnected(value: Instance<typeof OnDeviceDisconnectedEvent.value>): Promise<void> {
    const { serial } = value;
    for (const [key, context] of this._contexts) {
      if (context.serial !== serial) {
        continue;
      }
      try {
        const { organizationId, routineDeviceJobId } = context;
        const { contextCloser } = await this.process(organizationId, routineDeviceJobId);
        contextCloser.close();
      } catch (error) {
        this.logger.error(`DeviceJobContextRegistry: error while processing deviceJob: ${key}`, { error });
      }
    }
  }

  @OnEvent(OnDeviceJobStartedEvent.key)
  onDeviceJobStarted(value: Instance<typeof OnDeviceJobStartedEvent.value>): void {
    const { organizationId, routineDeviceJobId, stepStatusInfos, serial } = value;
    const key = this.createKey(organizationId, routineDeviceJobId);
    if (this._contexts.has(key)) {
      throw new Error(`DeviceJobContextRegistry: already registered for ${key}`);
    }
    this._contexts.set(key, {
      serial,
      organizationId,
      routineDeviceJobId,
      canceler: null,
      postProcessors: [],
      stepStatusInfos,
      cancelRequested: false,
    });
  }

  @OnEvent(OnDeviceJobCompletedEvent.key)
  async onDeviceJobCompleted(value: Instance<typeof OnDeviceJobCompletedEvent.value>): Promise<void> {
    const { organizationId, routineDeviceJobId, record, localStartedAt, localCompletedAt } = value;
    const key = this.createKey(organizationId, routineDeviceJobId);
    const context = this._contexts.get(key);
    if (!context) {
      throw new Error(`DeviceJobContextRegistry.onDeviceJobCompleted: not registered for ${key}`);
    }
    const { cancelRequested } = context;
    const { stepStatusInfos, contextCloser } = await this.process(organizationId, routineDeviceJobId);
    const everySuccess = stepStatusInfos.every((info) => info.stepStatus === PIPELINE_STATUS.SUCCESS);
    const deviceJobStatus = everySuccess ? PIPELINE_STATUS.SUCCESS : cancelRequested ? PIPELINE_STATUS.CANCELLED : PIPELINE_STATUS.FAILURE;
    try {
      await validateAndEmitEventAsync(this.eventEmitter, OnDeviceJobPostProcessCompletedEvent, {
        organizationId,
        routineDeviceJobId,
        record,
        deviceJobStatusInfo: { deviceJobStatus, localStartedAt, localCompletedAt },
        stepStatusInfos,
      });
    } catch (error) {
      this.logger.error(`DeviceJobContextRegistry: error while emitting OnDeviceJobPostProcessCompletedEvent for ${key}`, { error: errorify(error) });
    }
    contextCloser.close();
  }

  @OnEvent(OnDeviceJobCancelRequestedEvent.key)
  async onDeviceJobCancelRequested(value: Instance<typeof OnDeviceJobCancelRequestedEvent.value>): Promise<void> {
    const { organizationId, routineDeviceJobId } = value;
    const key = this.createKey(organizationId, routineDeviceJobId);
    const context = this._contexts.get(key);
    if (!context) {
      this.logger.warn(`DeviceJobContextRegistry.onDeviceJobCancelRequested: not registered for ${key}`);
      return;
    }
    context.cancelRequested = true;
    if (!context.canceler) {
      this.logger.warn(`DeviceJobContextRegistry.onDeviceJobCancelRequested: canceler is not set for ${key}`);
      return;
    }
    const canceler = context.canceler;
    context.canceler = null;
    try {
      this.logger.info(`DeviceJobContextRegistry: canceling deviceJob: ${key}`);
      await canceler?.cancel();
    } catch (error) {
      this.logger.error(`DeviceJobContextRegistry: error while canceling deviceJob: ${key}`, { error: errorify(error) });
    }
  }

  @OnEvent(OnStepInProgressEvent.key)
  onStepInProgress(value: Instance<typeof OnStepInProgressEvent.value>): void {
    const { organizationId, routineDeviceJobId, messageCanceler, messagePostProcessor, localTimeStamp, stepIndex } = value;
    const key = this.createKey(organizationId, routineDeviceJobId);
    const context = this._contexts.get(key);
    if (!context) {
      throw new Error(`DeviceJobContextRegistry.onStepInProgress: not registered for ${key}`);
    }
    context.canceler = messageCanceler;
    context.postProcessors.push(messagePostProcessor);
    const { stepStatusInfos } = context;
    const stepStatusInfo = stepStatusInfos[stepIndex];
    const { localStartedAt } = stepStatusInfo;
    if (localStartedAt !== null) {
      this.logger.warn(`DeviceJobContextRegistry: localStartedAt is replaced for ${key} at stepIndex: ${stepIndex}`);
    }
    stepStatusInfo.localStartedAt = localTimeStamp;
  }

  @OnEvent(OnStepCompletedEvent.key)
  onStepCompleted(value: Instance<typeof OnStepCompletedEvent.value>): void {
    const { organizationId, routineDeviceJobId, stepIndex, stepStatus, localTimeStamp } = value;
    const key = this.createKey(organizationId, routineDeviceJobId);
    const context = this._contexts.get(key);
    if (!context) {
      throw new Error(`DeviceJobContextRegistry.onStepCompleted: not registered for ${key}`);
    }
    if (context.stepStatusInfos.length <= stepIndex) {
      this.logger.warn(`DeviceJobContextRegistry: stepStatusInfos.length is less than stepIndex for ${key} at stepIndex: ${stepIndex}`);
      return;
    }
    const { stepStatusInfos } = context;
    const stepStatusInfo = stepStatusInfos[stepIndex];
    const { stepStatus: stepStatusInfoStepStatus, localCompletedAt } = stepStatusInfo;
    if (stepStatusInfoStepStatus !== PIPELINE_STATUS.UNSPECIFIED) {
      throw new Error(`DeviceJobContextRegistry: stepStatus is not UNSPECIFIED for ${key} at stepIndex: ${stepIndex}`);
    }
    stepStatusInfo.stepStatus = stepStatus;
    if (localCompletedAt !== null) {
      throw new Error(`DeviceJobContextRegistry: localCompletedAt is not null for ${key} at stepIndex: ${stepIndex}`);
    }
    stepStatusInfo.localCompletedAt = localTimeStamp;
    context.canceler = null;
  }

  cancelRequested(organizationId: OrganizationId, routineDeviceJobId: RoutineDeviceJobId): boolean {
    const key = this.createKey(organizationId, routineDeviceJobId);
    const context = this._contexts.get(key);
    if (!context) {
      this.logger.warn(`DeviceJobContextRegistry.cancelRequested: not registered for ${key}`);
      return false;
    }
    return context.cancelRequested;
  }

  private createKey(organizationId: OrganizationId, routineDeviceJobId: RoutineDeviceJobId): string {
    return `${organizationId}:${routineDeviceJobId}`;
  }

  private async process(organizationId: OrganizationId, routineDeviceJobId: RoutineDeviceJobId): Promise<DeviceJobProcessResult> {
    const key = this.createKey(organizationId, routineDeviceJobId);
    const context = this._contexts.get(key);
    if (!context) {
      throw new Error(`DeviceJobContextRegistry.process: not registered for ${key}`);
    }
    const canceler = context.canceler;
    context.canceler = null;
    const stepStatusInfos = context.stepStatusInfos;
    context.stepStatusInfos = [];
    const postProcessors = context.postProcessors;
    context.postProcessors = [];
    try {
      await canceler?.cancel();
    } catch (error) {
      this.logger.error(`DeviceJobContextRegistry: error while canceling deviceJob: ${key}`, { error });
    }
    stepStatusInfos.forEach((stepStatusInfo) => {
      if (stepStatusInfo.stepStatus === PIPELINE_STATUS.UNSPECIFIED) {
        if (stepStatusInfo.localStartedAt === null) {
          stepStatusInfo.stepStatus = PIPELINE_STATUS.SKIPPED;
        }
      }
    });
    for (let i = postProcessors.length - 1; i >= 0; i--) {
      try {
        await postProcessors[i].postProcess();
      } catch (error) {
        this.logger.error('Failed to post process message', {
          organizationId,
          routineDeviceJobId,
          error: errorify(error),
        });
      }
    }
    return {
      stepStatusInfos,
      contextCloser: new DeviceJobContextCloser({
        close: (): void => {
          setTimeout(() => {
            this.logger.info(`DeviceJobContextRegistry: closing deviceJob: ${key}`);
            this._contexts.delete(key);
          }, 10 * 1000);
        },
      }),
    };
  }
}
