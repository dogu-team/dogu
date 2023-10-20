import { CreateLicenseDto, LicenseBase } from '@dogu-private/console';
import { LicensePayload } from '@dogu-private/types';
import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LICENSE_ACTION } from '../auth/auth.types';
import { License, LicenseAction } from '../auth/decorators';
import { LicenseService } from './license.service';

@Controller('licenses')
export class LicenseController {
  constructor(
    @Inject(LicenseService)
    private readonly licenseService: LicenseService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Post()
  @LicenseAction(LICENSE_ACTION.CREATE)
  async createLicense(@Body() dto: CreateLicenseDto): Promise<string> {
    const rv = await this.dataSource.manager.transaction(async (manager) => {
      const token = await this.licenseService.createLicense(manager, dto);
      return token;
    });
    return rv;
  }

  @Get()
  @LicenseAction(LICENSE_ACTION.GET)
  async getLicense(@License() payload: LicensePayload): Promise<LicenseBase> {
    const license = await this.licenseService.getLicense(payload);
    return license;
  }
}
