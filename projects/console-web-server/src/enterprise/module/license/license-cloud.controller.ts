// import { FindLicenseDtoBase, LicenseBase, LicenseResponse, OrganizationPropCamel } from '@dogu-private/console';
import { Controller } from '@nestjs/common';
// import { FeatureLicenseService } from './feature-license.service';

@Controller('organizations/:organizationId/dogu-licenses')
export class LicenseCloudController {
  // constructor(
  //   @Inject(FeatureLicenseService)
  //   private readonly licenseService: FeatureLicenseService,
  //   @InjectDataSource()
  //   private readonly dataSource: DataSource,
  // ) {}
  // @Post()
  // @OrganizationPermission(ORGANIZATION_ROLE.OWNER)
  // async setLicense(
  //   @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
  //   @Body() dto: FindLicenseDtoBase,
  // ): Promise<LicenseBase> {
  //   const rv = await this.dataSource.manager.transaction(async (manager) => {
  //     const token = await this.licenseService.setLicense(manager, { ...dto, organizationId });
  //     return token;
  //   });
  //   return rv;
  // }
  // @Patch('')
  // @OrganizationPermission(ORGANIZATION_ROLE.OWNER)
  // async renewLicense(
  //   @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
  //   @Body() dto: FindLicenseDtoBase,
  // ): Promise<LicenseBase> {
  //   const rv = await this.dataSource.manager.transaction(async (manager) => {
  //     const token = await this.licenseService.renewLicense(manager, { ...dto, organizationId });
  //     return token;
  //   });
  //   return rv;
  // }
  // // @Delete('')
  // // @OrganizationPermission(ORGANIZATION_ROLE.OWNER)
  // // async deleteLicense(): Promise<void> {
  // //   throw new Error('Method not implemented.');
  // // }
  // @Get('')
  // @OrganizationPermission(ORGANIZATION_ROLE.OWNER)
  // async getLicense(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId): Promise<LicenseResponse> {
  //   const license = await this.licenseService.getLicense(organizationId);
  //   return license;
  // }
}
