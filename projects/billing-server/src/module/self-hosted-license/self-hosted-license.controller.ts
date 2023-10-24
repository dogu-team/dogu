import { CreateSelfHostedLicenseDto } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';

import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { SelfHostedLicenseService } from './self-hosted-license.service';

@Controller('self-hosted-licenses')
export class SelfHostedLicenseController {
  constructor(
    @Inject(SelfHostedLicenseService)
    private readonly selfHostedLicenseService: SelfHostedLicenseService,
  ) {}

  @Post()
  async createLicense(@Body() dto: CreateSelfHostedLicenseDto): Promise<SelfHostedLicense> {
    return await this.selfHostedLicenseService.createLicense(dto);
  }

  @Get(':organizationId')
  async getLicense(@Param('organizationId') organizationId: OrganizationId): Promise<SelfHostedLicense> {
    return await this.selfHostedLicenseService.getLicense(organizationId);
  }
}
