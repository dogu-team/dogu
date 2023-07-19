import { DestSummaryResponse, RemoteDestBase, RemoteDestPropCamel } from '@dogu-private/console';
import { RemoteDeviceJobId } from '@dogu-private/types';
import { Controller, Get, Inject, Param } from '@nestjs/common';
import { PROJECT_ROLE } from '../../auth/auth.types';
import { ProjectPermission } from '../../auth/decorators';

import { RemoteDestService } from './remote-dest.service';

@Controller('organizations/:organizationId/projects/:projectId/remote-device-jobs/:remoteDeviceJobId/remote-dests')
export class RemoteDestController {
  constructor(
    @Inject(RemoteDestService)
    private readonly remoteDestService: RemoteDestService,
  ) {}

  @Get('')
  @ProjectPermission(PROJECT_ROLE.READ)
  async findRemoteDestsByRemoteDeviceJobId(@Param(RemoteDestPropCamel.remoteDeviceJobId) remoteDeviceJobId: RemoteDeviceJobId): Promise<RemoteDestBase[]> {
    const rv = await this.remoteDestService.findRemoteDestsByRemoteDeviceJobId(remoteDeviceJobId);
    return rv;
  }

  @Get('summary')
  @ProjectPermission(PROJECT_ROLE.READ)
  async getRemoteDestSummary(@Param(RemoteDestPropCamel.remoteDeviceJobId) remoteDeviceJobId: RemoteDeviceJobId): Promise<DestSummaryResponse> {
    const rv = await this.remoteDestService.getRemoteDestSummary(remoteDeviceJobId);
    return rv;
  }
}
