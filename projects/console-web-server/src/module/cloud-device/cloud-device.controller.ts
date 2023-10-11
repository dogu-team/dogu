import { CloudDeviceMetadataBase } from '@dogu-private/console';
import { DeviceId, UserPayload } from '@dogu-private/types';
import { Controller, Get, Param, Query } from '@nestjs/common';

import { Device } from '../../db/entity/device.entity';
import { EMAIL_VERIFICATION } from '../auth/auth.types';
import { EmailVerification, User } from '../auth/decorators';
import { Page } from '../common/dto/pagination/page';
import { FindCloudDevicesDto } from './cloud-device.dto';
import { CloudDeviceService } from './cloud-device.service';

@Controller('/cloud-devices')
export class CloudDeviceController {
  constructor(private readonly cloudDeviceService: CloudDeviceService) {}

  @Get()
  @EmailVerification(EMAIL_VERIFICATION.VERIFIED)
  async getCloudDevices(@User() user: UserPayload, @Query() dto: FindCloudDevicesDto): Promise<Page<CloudDeviceMetadataBase>> {
    return await this.cloudDeviceService.findCloudDevices(dto);
  }

  @Get(':model/versions')
  @EmailVerification(EMAIL_VERIFICATION.VERIFIED)
  async getCloudDeviceVersionsByModel(@User() user: UserPayload, @Param('model') model: string): Promise<Device[]> {
    return await this.cloudDeviceService.findCloudDeviceVersionsByModel(model);
  }

  @Get(':deviceId')
  @EmailVerification(EMAIL_VERIFICATION.VERIFIED)
  async findCloudDeviceById(@User() user: UserPayload, @Param('deviceId') deviceId: DeviceId): Promise<Device> {
    return await this.cloudDeviceService.findCloudDeviceById(deviceId);
  }
}
