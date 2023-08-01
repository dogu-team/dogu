import { UpdateDeviceJobStatusRequestBody, UpdateStepStatusRequestBody } from '@dogu-private/console-host-agent';
import { DestId, DeviceId, OrganizationId, ProjectId, RemoteDestId, RoutineDeviceJobId, RoutinePipelineId, RoutineStepId, UserId } from '@dogu-private/types';
import { UpdateDestStatusRequestBody } from '@dogu-tech/console-dest';
import { UpdateRemoteDestStateRequestBody } from '@dogu-tech/console-remote-dest';
import { Injectable } from '@nestjs/common';

export class UpdatePipelineEvent {}
export class UpdtaeRemoteDeviceJobEvent {}

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
    public readonly projectId: ProjectId, //
    public pipelineId: RoutinePipelineId,
    public readonly userId: UserId | null,
  ) {
    super();
  }
}

export class UpdateDestStateEvent extends UpdatePipelineEvent {
  constructor(public readonly destId: DestId, public readonly updateDestStatusRequestBody: UpdateDestStatusRequestBody) {
    super();
  }
}

export class UpdateRemoteDestStateEvent extends UpdtaeRemoteDeviceJobEvent {
  constructor(public readonly remoteDestId: RemoteDestId, public readonly updateRemoteDestStateRequestBody: UpdateRemoteDestStateRequestBody) {
    super();
  }
}

@Injectable()
export class CancelPipelineQueue {
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

@Injectable()
export class UpdateRemoteDestStateQueue {
  private queue = new Array<UpdateRemoteDestStateEvent>();

  enqueue(event: UpdateRemoteDestStateEvent): void {
    this.queue.push(event);
    return;
  }

  dequeue(): UpdateRemoteDestStateEvent | undefined {
    return this.queue.shift();
  }

  drain(): UpdateRemoteDestStateEvent[] {
    const drained = this.queue;
    this.queue = new Array<UpdateRemoteDestStateEvent>();
    return drained;
  }
}
