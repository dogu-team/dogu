import { HostPropCamel, OrganizationPropCamel } from '@dogu-private/console';
import { PrivateHost, UpdateHostRequestBody } from '@dogu-private/console-host-agent';
import { HostId, OrganizationId } from '@dogu-private/types';
import { Body, Controller, NotFoundException, Param, Patch } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import { Host } from '../../db/entity/host.entity';
import { HOST_ACTION_TYPE } from '../auth/auth.types';
import { HostPermission } from '../auth/decorators';
import { IsHostExist } from '../organization/host/host.decorators';
import { IsOrganizationExist } from '../organization/organization.decorators';

@Controller(PrivateHost.controller.path)
export class PrivateHostController {
  constructor(@InjectRepository(Host) private readonly hostRepository: Repository<Host>) {}

  @Patch(PrivateHost.updateHostHeartbeatNow.path)
  @HostPermission(HOST_ACTION_TYPE.HOST_API)
  async updateHostHeartbeatNow(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param(HostPropCamel.hostId, IsHostExist) hostId: HostId,
  ): Promise<void> {
    const exist = await this.hostRepository.exist({ where: { hostId } });
    if (!exist) {
      throw new NotFoundException({
        message: 'Host not found',
        organizationId,
        hostId,
      });
    }
    await this.hostRepository.update({ hostId }, { heartbeat: () => 'NOW()' });
  }

  @Patch(PrivateHost.update.path)
  @HostPermission(HOST_ACTION_TYPE.HOST_API)
  async update(
    @Param(OrganizationPropCamel.organizationId, IsOrganizationExist) organizationId: OrganizationId,
    @Param(HostPropCamel.hostId, IsHostExist) hostId: HostId,
    @Body() body: UpdateHostRequestBody,
  ): Promise<void> {
    const update: QueryDeepPartialEntity<Host> = {};

    if (body.platform) {
      update.platform = body.platform;
    }
    if (body.rootWorkspace) {
      update.rootWorkspace = body.rootWorkspace;
    }

    if (body.deviceServerPort) {
      update.deviceServerPort = body.deviceServerPort;
    }

    if (body.agentVersion) {
      update.agentVersion = body.agentVersion;
    }

    await this.hostRepository.update({ hostId }, update);
  }
}
