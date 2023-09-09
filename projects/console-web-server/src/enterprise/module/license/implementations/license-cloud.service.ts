import { CreateLicenseDto, DoguLicenseId, LicenseBase, LicenseId, LicenseValidateClass } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Retry, stringify, transformAndValidate } from '@dogu-tech/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import axios from 'axios';
import { DataSource, EntityManager } from 'typeorm';
import { config } from '../../../../config';
import { DoguLicense } from '../../../../db/entity/dogu-license.enitiy';
import { FeatureLicenseService } from '../feature-license.service';

@Injectable()
export class LicenseCloudService extends FeatureLicenseService {
  private readonly licenseServerUrl = config.license.url;
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super('cloud');
  }

  @Retry()
  private async getLicenseApiCall(organizationId: OrganizationId, doguLicenseId: DoguLicenseId, token: string): Promise<LicenseBase> {
    const query = new URLSearchParams({
      organizationId,
    });

    const response = await axios.get(`${this.licenseServerUrl}/licenses/${doguLicenseId}/?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        organizationId,
      },
    });
    const serverLicenseInfo = response.data;
    const licenseInfo = await transformAndValidate(LicenseValidateClass, serverLicenseInfo);
    return licenseInfo;
  }

  async getLicense(organizationId: OrganizationId, doguLicenseId: DoguLicenseId): Promise<LicenseBase> {
    const doguLicense = await this.dataSource.manager.getRepository(DoguLicense).findOne({ where: { doguLicenseId } });
    if (!doguLicense) throw new HttpException('License not found', HttpStatus.NOT_FOUND);

    const query = new URLSearchParams({
      organizationId,
    });

    try {
      const licenseInfo = await this.getLicenseApiCall(organizationId, doguLicenseId, doguLicense.token);
      return licenseInfo;
    } catch (error) {
      throw new HttpException(stringify(error), HttpStatus.BAD_REQUEST);
    }
  }

  async createLicense(manager: EntityManager, dto: CreateLicenseDto): Promise<string> {
    return '';
  }

  async renewLicense(licenseId: LicenseId, dto: CreateLicenseDto): Promise<string> {
    return '';
  }

  async deleteLicense(licenseId: LicenseId): Promise<void> {}
}
