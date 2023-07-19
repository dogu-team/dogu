import { OrganizationPropCamel, RemoteDestPropCamel, RemoteDeviceJobPropCamel } from '@dogu-private/console';
import { OrganizationId, RemoteDestId, RemoteDeviceJobId } from '@dogu-private/types';
import { CreateRemoteDestRequestBody, CreateRemoteDestResponse, PublicRemoteDest, UpdateRemoteDestStateRequestBody } from '@dogu-tech/console-remote-dest';
import { Body, Controller, Inject, Param, Patch, Post } from '@nestjs/common';
import { HOST_ACTION_TYPE } from '../auth/auth.types';
import { HostPermission } from '../auth/decorators';
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
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async createDest(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(RemoteDeviceJobPropCamel.remoteDeviceJobId) remoteDeviceJobid: RemoteDeviceJobId, //
    @Body() body: CreateRemoteDestRequestBody,
  ): Promise<CreateRemoteDestResponse> {
    const rv = await this.remoteDestService.createRemoteDest(remoteDeviceJobid, body);
    return rv;
  }

  @Patch(PublicRemoteDest.updateRemoteDestState.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async updateDestState(@Param(RemoteDestPropCamel.remoteDestId) remoteDestId: RemoteDestId, @Body() body: UpdateRemoteDestStateRequestBody): Promise<void> {
    const updateEvent: UpdateRemoteDestStateEvent = new UpdateRemoteDestStateEvent(remoteDestId, body);
    this.updateRemoteDestStateQueue.enqueue(updateEvent);
  }
}
