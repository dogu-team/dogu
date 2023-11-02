import { CreateCloudLicenseDto, FindCloudLicenseDto } from '@dogu-private/console';
import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';

import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { CloudLicenseService } from './cloud-license.service';

@Controller('cloud-licenses')
export class CloudLicenseController {
  constructor(
    @Inject(CloudLicenseService)
    private readonly cloudLicenseService: CloudLicenseService,
  ) {}

  @Post()
  @BillingTokenPermission()
  async createCloudLicense(@Body() dto: CreateCloudLicenseDto): Promise<CloudLicense> {
    return await this.cloudLicenseService.createCloudLicense(dto);
  }

  @Get()
  @BillingTokenPermission()
  async findCloudLicense(@Query() dto: FindCloudLicenseDto): Promise<CloudLicense> {
    return await this.cloudLicenseService.findCloudLicense(dto);
  }
}
