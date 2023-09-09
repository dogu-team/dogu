import { CreateLicenseDto, DoguLicenseId, DoguLicensePropCamel, LicenseBase, OrganizationPropCamel } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FeatureLicenseService } from './feature-license.service';

@Controller('dogu-licenses')
export class LicenseController {
  constructor(
    @Inject(FeatureLicenseService)
    private readonly licenseService: FeatureLicenseService,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Post()
  //FIXME:(felix) need to something guards
  async createLicense(@Body() dto: CreateLicenseDto): Promise<string> {
    // const rv = await this.dataSource.manager.transaction(async (manager) => {
    //   const token = await this.licenseService.createLicense(manager, dto);
    //   return token;
    // });
    // return rv;
    return '';
  }

  @Patch('/:doguLicenseId')
  //FIXME:(felix) need to something guards
  async renewLicense(
    @Param(DoguLicensePropCamel.doguLicenseId) doguLicenseId: DoguLicenseId, //
    @Body() dto: CreateLicenseDto,
  ): Promise<string> {
    // const token = await this.licenseService.renewLicense(licenseId, dto);
    // return token;
    return '';
  }

  @Delete('/:doguLicenseId')
  //FIXME:(felix) need to something guards
  async deleteLicense(@Param(DoguLicensePropCamel.doguLicenseId) doguLicenseId: DoguLicenseId): Promise<void> {}

  @Get('/:doguLicenseId')
  //FIXME:(felix) need to something guards & verify
  async getLicense(
    @Query(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param(DoguLicensePropCamel.doguLicenseId) doguLicenseId: DoguLicenseId,
  ): Promise<LicenseBase> {
    const license = await this.licenseService.getLicense(organizationId, doguLicenseId);
    return license;
  }

  // @Post('/:licenseId/verify')
}
