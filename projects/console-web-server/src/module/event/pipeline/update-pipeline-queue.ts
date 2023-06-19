import { UpdateDeviceJobStatusRequestBody, UpdateStepStatusRequestBody } from '@dogu-private/console-host-agent';
import { DestId, DeviceId, OrganizationId, ProjectId, RoutineDeviceJobId, RoutinePipelineId, RoutineStepId, UserId } from '@dogu-private/types';
import { UpdateDestStatusRequestBody } from '@dogu-tech/console-dest';
import { Injectable } from '@nestjs/common';

export class UpdatePipelineEvent {}

export class UpdateStepStatusEvent extends UpdatePipelineEvent {
  constructor(
    public readonly organizationId: OrganizationId,
    public readonly deviceId: DeviceId,
    public readonly stepId: RoutineStepId,
    public readonly updateStepStatusRequestBody: UpdateStepStatusRequestBody,
  ) {
    super();
  }
}

export class UpdateDeviceJobStatusEvent extends UpdatePipelineEvent {
  constructor(
    public readonly organizationId: OrganizationId, //
    public readonly deviceJobId: RoutineDeviceJobId,
    public readonly updateDeviceJobStatusRequestBody: UpdateDeviceJobStatusRequestBody,
  ) {
    super();
  }
}

export class CancelPipelineEvent extends UpdatePipelineEvent {
  constructor(
    public readonly organizationId: OrganizationId, //
    public readonly projectId: ProjectId,
    public pipelineId: RoutinePipelineId,
    public readonly userId: UserId,
  ) {
    super();
  }
}

export class UpdateDestStateEvent extends UpdatePipelineEvent {
  constructor(public readonly destId: DestId, public readonly updateDestStatusRequestBody: UpdateDestStatusRequestBody) {
    super();
  }
}

@Injectable()
export class CanclePipelineQueue {
  private queue = new Array<CancelPipelineEvent>();

  enqueue(event: CancelPipelineEvent): void {
    this.queue.push(event);
    return;
  }

  dequeue(): CancelPipelineEvent | undefined {
    return this.queue.shift();
  }

  drain(): CancelPipelineEvent[] {
    const drained = this.queue;
    this.queue = new Array<CancelPipelineEvent>();
    return drained;
  }
}

@Injectable()
export class UpdateDeviceJobStatusQueue {
  private queue = new Array<UpdateDeviceJobStatusEvent>();

  enqueue(event: UpdateDeviceJobStatusEvent): void {
    this.queue.push(event);
    return;
  }

  dequeue(): UpdateDeviceJobStatusEvent | undefined {
    return this.queue.shift();
  }

  drain(): UpdateDeviceJobStatusEvent[] {
    const drained = this.queue;
    this.queue = new Array<UpdateDeviceJobStatusEvent>();
    return drained;
  }
}

@Injectable()
export class UpdateStepStatusQueue {
  private queue = new Array<UpdateStepStatusEvent>();

  enqueue(event: UpdateStepStatusEvent): void {
    this.queue.push(event);
    return;
  }

  dequeue(): UpdateStepStatusEvent | undefined {
    return this.queue.shift();
  }

  drain(): UpdateStepStatusEvent[] {
    const drained = this.queue;
    this.queue = new Array<UpdateStepStatusEvent>();
    return drained;
  }
}

@Injectable()
export class UpdateDestStateQueue {
  private queue = new Array<UpdateDestStateEvent>();

  enqueue(event: UpdateDestStateEvent): void {
    this.queue.push(event);
    return;
  }

  dequeue(): UpdateDestStateEvent | undefined {
    return this.queue.shift();
  }

  drain(): UpdateDestStateEvent[] {
    const drained = this.queue;
    this.queue = new Array<UpdateDestStateEvent>();
    return drained;
  }
}
