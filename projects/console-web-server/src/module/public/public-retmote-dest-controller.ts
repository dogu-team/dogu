import { DestPropCamel, OrganizationPropCamel } from '@dogu-private/console';
import { DestId, OrganizationId } from '@dogu-private/types';
import { CreateRemoteDestRequestBody, CreateRemoteDestResponse, PublicRemoteDest, UpdateRemoteDestStateRequestBody } from '@dogu-tech/console-remote-dest';
import { Body, Controller, Inject, Param, Patch, Post } from '@nestjs/common';
import { HOST_ACTION_TYPE } from '../auth/auth.types';
import { HostPermission } from '../auth/decorators';
import { UpdateDestStateQueue } from '../event/pipeline/update-pipeline-queue';
import { DestService } from '../routine/pipeline/dest/dest.service';

@Controller(PublicRemoteDest.controller.path)
export class PublicDestController {
  constructor(
    @Inject(DestService)
    private readonly destService: DestService,
    @Inject(UpdateDestStateQueue)
    private readonly updateDestStateQueue: UpdateDestStateQueue,
  ) {}

  @Post(PublicRemoteDest.createRemoteDest.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async createDest(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Body() body: CreateRemoteDestRequestBody,
  ): Promise<CreateRemoteDestResponse> {
    // const rv = await this.destService.createDest(body);
    // return rv;
    return {} as any;
  }

  @Patch(PublicRemoteDest.updateRemoteDestState.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async updateDestState(@Param(DestPropCamel.destId) destId: DestId, @Body() body: UpdateRemoteDestStateRequestBody): Promise<void> {}
}
