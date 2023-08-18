import { HostPropCamel, OrganizationPropCamel } from '@dogu-private/console';
import { HostId, OrganizationId } from '@dogu-private/types';
import { Controller, Param, Patch } from '@nestjs/common';
import { ORGANIZATION_ROLE } from '../../../module/auth/auth.types';
import { OrganizationPermission } from '../../../module/auth/decorators';
import { IsHostExist } from '../../../module/organization/host/host.decorators';
import { HostAppService } from './host-app.service';

@Controller('/organizations/:organizationId/hosts')
export class HostAppController {
  constructor(private readonly service: HostAppService) {}

  @Patch('/:hostId/app')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async update(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(HostPropCamel.hostId, IsHostExist) hostId: HostId,
  ): Promise<void> {
    await this.service.update(organizationId, hostId);
  }
}
