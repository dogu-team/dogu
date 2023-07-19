import { RemoteDestPropCamel, RemoteDeviceJobPropCamel } from '@dogu-private/console';
import { RemoteDestId, RemoteDeviceJobId } from '@dogu-private/types';
import { CreateRemoteDestRequestBody, CreateRemoteDestResponse, PublicRemoteDest, UpdateRemoteDestStateRequestBody } from '@dogu-tech/console-remote-dest';
import { Body, Controller, Inject, Param, Patch, Post } from '@nestjs/common';
import { UpdateRemoteDestStateEvent, UpdateRemoteDestStateQueue } from '../event/pipeline/update-pipeline-queue';
import { RemoteDestService } from '../remote/remote-dest/remote-dest.service';

@Controller(PublicRemoteDest.controller.path)
export class PublicRemoteDestController {
  constructor(
    @Inject(RemoteDestService)
    private readonly remoteDestService: RemoteDestService,
    @Inject(UpdateRemoteDestStateQueue)
    private readonly updateRemoteDestStateQueue: UpdateRemoteDestStateQueue,
  ) {}

  @Post(PublicRemoteDest.createRemoteDest.path)
  // FIXME:(felix) token validation
  async createRemoteDest(
    @Param(RemoteDeviceJobPropCamel.remoteDeviceJobId) remoteDeviceJobid: RemoteDeviceJobId, //
    @Body() body: CreateRemoteDestRequestBody,
  ): Promise<CreateRemoteDestResponse> {
    const rv = await this.remoteDestService.createRemoteDest(remoteDeviceJobid, body);
    return rv;
  }

  @Patch(PublicRemoteDest.updateRemoteDestState.path)
  // FIXME:(felix) token validation
  async updateRemoteDestState(@Param(RemoteDestPropCamel.remoteDestId) remoteDestId: RemoteDestId, @Body() body: UpdateRemoteDestStateRequestBody): Promise<void> {
    const updateEvent: UpdateRemoteDestStateEvent = new UpdateRemoteDestStateEvent(remoteDestId, body);
    this.updateRemoteDestStateQueue.enqueue(updateEvent);
  }
}
