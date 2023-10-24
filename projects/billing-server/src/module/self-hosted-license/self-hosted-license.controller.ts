import { Controller, Inject } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { SelfHostedLicenseService } from './self-hosted-license.service';

@Controller('self-hosted-licenses')
export class SelfHostedLicenseController {
  constructor(
    @Inject(SelfHostedLicenseService)
    private readonly selfHostedLicenseService: SelfHostedLicenseService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // @Post()
  // @LicenseAction(LICENSE_ACTION.CREATE)
  // async createLicense(@Body() dto: CreateLicenseDto): Promise<string> {
  //   const rv = await this.dataSource.manager.transaction(async (manager) => {
  //     const token = await this.licenseService.createLicense(manager, dto);
  //     return token;
  //   });
  //   return rv;
  // }

  // @Get()
  // @LicenseAction(LICENSE_ACTION.GET)
  // async getLicense(@License() payload: LicensePayload): Promise<LicenseBase> {
  //   const license = await this.licenseService.getLicense(payload);
  //   return license;
  // }
}
