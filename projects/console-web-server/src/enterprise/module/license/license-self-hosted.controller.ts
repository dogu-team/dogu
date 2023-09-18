import { FindLicenseDtoBase, LicenseResponse } from '@dogu-private/console';
import { Body, Controller, Delete, Get, Inject, Patch, Post } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SELF_HOSTED_ROLE } from '../../../module/auth/auth.types';
import { SelfHostedPermission } from '../../../module/auth/decorators';
import { FeatureLicenseService } from './feature-license.service';

@Controller('dogu-licenses')
export class LicenseSelfHostedController {
  constructor(
    @Inject(FeatureLicenseService)
    private readonly licenseService: FeatureLicenseService,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Post()
  @SelfHostedPermission(SELF_HOSTED_ROLE.ROOT)
  async setLicense(@Body() dto: FindLicenseDtoBase): Promise<LicenseResponse> {
    const rv = await this.dataSource.manager.transaction(async (manager) => {
      const token = await this.licenseService.setLicense(manager, dto);
      return token;
    });
    return rv;
  }

  @Patch('')
  @SelfHostedPermission(SELF_HOSTED_ROLE.ROOT)
  async renewLicense(@Body() dto: FindLicenseDtoBase): Promise<LicenseResponse> {
    const rv = await this.dataSource.manager.transaction(async (manager) => {
      const token = await this.licenseService.renewLicense(manager, dto);
      return token;
    });
    return rv;
  }

  @Delete('')
  @SelfHostedPermission(SELF_HOSTED_ROLE.ROOT)
  async deleteLicense(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  @Get('')
  @SelfHostedPermission(SELF_HOSTED_ROLE.ROOT)
  async getLicense(): Promise<LicenseResponse> {
    const license = await this.licenseService.getLicense(null);
    return license;
  }
}
