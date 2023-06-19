import { HostBase, HostPropCamel, OrganizationPropCamel } from '@dogu-private/console';
import { HostId, OrganizationId, UserPayload } from '@dogu-private/types';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ORGANIZATION_ROLE } from '../../auth/auth.types';
import { OrganizationPermission, User } from '../../auth/decorators';
import { Page } from '../../common/dto/pagination/page';
import { CreateHostDto, FindHostsByOrganizationIdDto, UpdateHostNameDto } from './dto/host.dto';
import { HostService } from './host.service';

@Controller('organizations/:organizationId/hosts')
export class HostController {
  constructor(private readonly hostService: HostService) {}

  // RDB START //
  @Get('')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findHostsByorganizationId(
    @User() userPayload: UserPayload,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Query() dto: FindHostsByOrganizationIdDto,
  ): Promise<Page<HostBase>> {
    const rv = await this.hostService.findHostsByOrganizationId(userPayload, organizationId, dto);
    return rv;
  }

  @Get(':hostId/token')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async getCurrentHostToken(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(HostPropCamel.hostId) hostId: HostId,
  ): Promise<string> {
    const rv = await this.hostService.getCurrentHostToken(hostId);
    return rv;
  }

  @Post(':hostId/token/reissue')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async refreshHostToken(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Param(HostPropCamel.hostId) hostId: HostId): Promise<string> {
    const rv = await this.hostService.reissueHostToken(hostId);
    return rv;
  }

  @Post('')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async createHost(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @User() userPayload: UserPayload, @Body() dto: CreateHostDto): Promise<string> {
    const rv = await this.hostService.createHost(organizationId, userPayload.userId, dto);
    return rv;
  }

  @Patch(':hostId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async updateHostName(@Param(HostPropCamel.hostId) hostId: HostId, @Body() dto: UpdateHostNameDto): Promise<HostBase> {
    const rv = await this.hostService.updateHostName(hostId, dto);
    return rv;
  }

  @Post(':hostId/usage-device')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async enableHostDevice(@Param(HostPropCamel.hostId) hostId: HostId): Promise<void> {
    await this.hostService.enableHostDevice(hostId);
    return;
  }

  @Delete(':hostId/usage-device')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async disableHostDevice(@Param(HostPropCamel.hostId) hostId: HostId): Promise<void> {
    await this.hostService.disableHostDevice(hostId);
    return;
  }

  @Delete(':hostId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async softRemoveHost(@Param(HostPropCamel.hostId) hostId: HostId): Promise<void> {
    await this.hostService.softRemoveHost(hostId);
    return;
  }

  @Get('/:hostId')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async getHost(@User() user: UserPayload, @Param(HostPropCamel.hostId) hostId: HostId): Promise<HostBase> {
    const rv = await this.hostService.findHost(hostId);
    return rv;
  }
  // RDB END //

  // IDB START //
  // @Get(':hostId/runtime')
  // async getHostRuntimeInfoFromIDB(@User() user: UserPayload, @Param(HostPropCamel.hostId) hostId: HostId, @Query() dto: GetRuntimeHostInfoDto): Promise<HostRuntimeFrontInfo> {
  //   return await this.influxDbHostService.getRuntimeInfo(dto, user.teamId, id);
  // }

  // @Get(':hostId/runtime/last')
  // async getHostRuntimeLastInfoFromIDB(@User() user: UserPayload, @Param(HostPropCamel.hostId) hostId: HostId, @Query() dto: GetRuntimeHostLastInfoDto): Promise<HostRuntimeFrontInfo> {
  //   return await this.influxDbHostService.getRuntimeLastInfo(dto, user.teamId, id);
  // }

  // @Get(':hostId/runtime/total')
  // async getHostRuntimeTotalInfoFromIDB(@User() user: UserPayload, @Param(HostPropCamel.hostId) hostId: HostId, @Query() dto: GetRuntimeHostTotalInfoDto): Promise<HostRuntimeFrontInfo> {
  //   return await this.influxDbHostService.getRuntimeTotalInfo(dto, user.teamId, id);
  // }
  // IDB END //
}
