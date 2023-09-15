import { FindLicenseDtoBase, LicenseBase } from '@dogu-private/console';
import { Body, Controller, Delete, Get, Inject, Patch, Post } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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
  // @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async setLicense(
    // @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Body() dto: FindLicenseDtoBase,
  ): Promise<LicenseBase> {
    const rv = await this.dataSource.manager.transaction(async (manager) => {
      const token = await this.licenseService.setLicense(manager, dto);
      return token;
    });
    return rv;
  }

  @Patch('')
  // @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async renewLicense(
    // @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Body() dto: FindLicenseDtoBase,
  ): Promise<LicenseBase> {
    const rv = await this.dataSource.manager.transaction(async (manager) => {
      const token = await this.licenseService.renewLicense(manager, dto);
      return token;
    });
    return rv;
  }

  @Delete('')
  // @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async deleteLicense(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  @Get('')
  // @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async getLicense(): // @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId
  Promise<LicenseBase> {
    const license = await this.licenseService.getLicense(null);
    return license;
  }
}
