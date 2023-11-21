import { DestPropCamel, OrganizationPropCamel } from '@dogu-private/console';
import { DestId, OrganizationId } from '@dogu-private/types';
import { CreateDestRequestBody, CreateDestResponse, PublicDest, UpdateDestStatusRequestBody } from '@dogu-tech/console-dest';
import { Body, Controller, Inject, Param, Patch, Post } from '@nestjs/common';
import { HOST_ACTION_TYPE } from '../auth/auth.types';
import { HostPermission } from '../auth/decorators';
import { UpdateDestStateEvent, UpdateDestStateQueue } from '../event/pipeline/update-pipeline-queue';
import { DestService } from '../routine/pipeline/dest/dest.service';

@Controller(PublicDest.controller.path)
export class PublicDestController {
  constructor(
    @Inject(DestService)
    private readonly destService: DestService,
    @Inject(UpdateDestStateQueue)
    private readonly updateDestStateQueue: UpdateDestStateQueue,
  ) {}

  @Post(PublicDest.createDest.path)
  @HostPermission(HOST_ACTION_TYPE.HOST_API)
  async createDest(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Body() body: CreateDestRequestBody,
  ): Promise<CreateDestResponse> {
    const rv = await this.destService.createDest(body);
    return rv;
  }

  @Patch(PublicDest.updateDestState.path)
  @HostPermission(HOST_ACTION_TYPE.HOST_API)
  updateDestState(@Param(DestPropCamel.destId) destId: DestId, @Body() body: UpdateDestStatusRequestBody): void {
    const updateEvent: UpdateDestStateEvent = new UpdateDestStateEvent(destId, body);
    this.updateDestStateQueue.enqueue(updateEvent);
  }
}
