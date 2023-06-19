import { DevicePropCamel, OrganizationPropCamel } from '@dogu-private/console';
import { DeviceId, OrganizationId } from '@dogu-private/types';
import { PublicDevice, WriteGameRunTimeInfosRequestBody } from '@dogu-tech/console-gamium';
import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { HOST_ACTION_TYPE } from '../auth/auth.types';
import { HostPermission } from '../auth/decorators';
import { InfluxDbDeviceService } from '../influxdb/influxdb-device.service';

@Controller(PublicDevice.controller.path)
export class PublicDeviceController {
  constructor(
    @Inject(InfluxDbDeviceService)
    private readonly influxDbDeviceService: InfluxDbDeviceService,
  ) {}

  @Post(PublicDevice.writeGameRunTimeInfos.path)
  @HostPermission(HOST_ACTION_TYPE.DEVICE_API)
  async writeGameRunTimeInfos(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(DevicePropCamel.deviceId) deviceId: DeviceId,
    @Body() body: WriteGameRunTimeInfosRequestBody,
  ): Promise<void> {
    const { gameRuntimeInfos } = body;
    await this.influxDbDeviceService.writeGameRunTimeInfos(organizationId, deviceId, gameRuntimeInfos);
  }
}
