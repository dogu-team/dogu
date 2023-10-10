import { UserPayload } from '@dogu-private/types';
import { Controller, Get, Query } from '@nestjs/common';

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
  async getCloudDevice(@User() user: UserPayload, @Query() dto: FindCloudDevicesDto): Promise<Page<Device>> {
    return await this.cloudDeviceService.findCloudDevices(dto);
  }
}
