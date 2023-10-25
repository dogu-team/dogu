// import { CreateLicenseDto, FindLicenseWithCloudDto, LicenseId, LicenseResponse } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
// import { FeatureLicenseService } from '../feature-license.service';

@Injectable()
// export class LicenseCloudService extends FeatureLicenseService {
export class LicenseCloudService {
  // private readonly licenseServerUrl = config.license.url;
  // constructor(
  //   @InjectDataSource()
  //   private readonly dataSource: DataSource,
  // ) {
  //   super('cloud');
  // }
  // @Retry()
  // private async getLicenseApiCall(dto: FindLicenseWithCloudDto) {
  //   const { licenseToken, organizationId } = dto;
  //   const query = new URLSearchParams({
  //     organizationId,
  //   });
  //   const response = await axios.get(`${this.licenseServerUrl}/licenses/?${query.toString()}`, {
  //     headers: {
  //       Authorization: `Bearer ${licenseToken}`,
  //     },
  //   });
  //   return response;
  // }
  // async getLicense(organizationId: OrganizationId): Promise<LicenseResponse> {
  //   throw new HttpException('Method not implemented.', HttpStatus.NOT_IMPLEMENTED);
  // }
  // async createLicense(manager: EntityManager, dto: CreateLicenseDto): Promise<string> {
  //   throw new Error('Method not implemented.');
  // }
  // async setLicense(manager: EntityManager, dto: FindLicenseWithCloudDto): Promise<LicenseResponse> {
  //   throw new HttpException('Method not implemented.', HttpStatus.NOT_IMPLEMENTED);
  // }
  // async renewLicense(manager: EntityManager, dto: FindLicenseWithCloudDto): Promise<LicenseResponse> {
  //   throw new HttpException('Method not implemented.', HttpStatus.NOT_IMPLEMENTED);
  // }
  // async deleteLicense(licenseId: LicenseId): Promise<void> {
  //   throw new Error('Method not implemented.');
  // }
}
