import { CreateSelfHostedLicenseDto } from '@dogu-private/console';
import { Body, Controller, Get, Inject, Post } from '@nestjs/common';

import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { SelfHostedLicensePermission, SelfHostedLicenseUser } from '../auth/guard/self-hosted-license.guard';
import { SelfHostedLicenseService } from './self-hosted-license.service';

@Controller('self-hosted-licenses')
export class SelfHostedLicenseController {
  constructor(
    @Inject(SelfHostedLicenseService)
    private readonly selfHostedLicenseService: SelfHostedLicenseService,
  ) {}

  @Post()
  @BillingTokenPermission()
  async createSelfHostedLicense(@Body() dto: CreateSelfHostedLicenseDto): Promise<SelfHostedLicense> {
    return await this.selfHostedLicenseService.createSelfHostedLicense(dto);
  }

  @Get()
  @SelfHostedLicensePermission()
  async findSelfHostedLicense(@SelfHostedLicenseUser() dto: SelfHostedLicenseUser): Promise<SelfHostedLicense> {
    return await this.selfHostedLicenseService.findSelfHostedLicense(dto);
  }
}
