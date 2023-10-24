import { CreateCloudLicenseDto } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';

import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { CloudLicenseService } from './cloud-license.service';

@Controller('cloud-licenses')
export class CloudLicenseController {
  constructor(
    @Inject(CloudLicenseService)
    private readonly cloudLicenseService: CloudLicenseService,
  ) {}

  @Post()
  async createLicense(@Body() dto: CreateCloudLicenseDto): Promise<CloudLicense> {
    return await this.cloudLicenseService.createLicense(dto);
  }

  @Get(':organizationId')
  async getLicense(@Param('organizationId') organizationId: OrganizationId): Promise<CloudLicense> {
    return await this.cloudLicenseService.getLicense(organizationId);
  }
}
