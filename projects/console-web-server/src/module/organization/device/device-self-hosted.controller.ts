import { GetEnabledDeviceCountResponse, OrganizationPropCamel } from '@dogu-private/console';
import { OrganizationId, UserPayload } from '@dogu-private/types';
import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SELF_HOSTED_ROLE } from '../../auth/auth.types';
import { SelfHostedPermission, User } from '../../auth/decorators';
import { DeviceStatusService } from './device-status.service';
import { FindDevicesByOrganizationIdDto } from './dto/device.dto';

@Controller('devices')
export class DeviceSelfHostedController {
  constructor(
    @Inject(DeviceStatusService)
    private readonly deviceStatusService: DeviceStatusService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get('count')
  @SelfHostedPermission(SELF_HOSTED_ROLE.MEMBER)
  async findAllDevices(
    @User() user: UserPayload, //
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Query() dto: FindDevicesByOrganizationIdDto,
  ): Promise<GetEnabledDeviceCountResponse> {
    const rv = await this.deviceStatusService.getEnabledDeviceCount();
    return rv;
  }
}
