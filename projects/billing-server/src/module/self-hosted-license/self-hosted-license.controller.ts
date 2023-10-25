import { CreateSelfHostedLicenseDto } from '@dogu-private/console';
import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';

import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { FindSelfHostedLicenseQueryDto } from './self-hosted-license.dto';
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

  @Get()
  async findLicense(@Query() dto: FindSelfHostedLicenseQueryDto): Promise<SelfHostedLicense> {
    return await this.selfHostedLicenseService.findLicense(dto);
  }
}
