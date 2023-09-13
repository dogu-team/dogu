import { CreateLicenseDto, DEFAULT_CLOUD_LICENSE_DATA, FindLicenseDtoBase, FindLicenseWithCloudDto, LicenseBase, LicenseId, LicenseValidateClass } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Retry, transformAndValidate } from '@dogu-tech/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import axios, { AxiosError } from 'axios';
import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
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
  private async getLicenseApiCall(dto: FindLicenseWithCloudDto) {
    const { licenseToken, organizationId } = dto;
    const query = new URLSearchParams({
      organizationId,
    });
    const response = await axios.get(`${this.licenseServerUrl}/licenses/?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${licenseToken}`,
      },
    });
    return response;
  }

  async getLicense(organizationId: OrganizationId): Promise<LicenseBase> {
    const doguLicense = await this.dataSource.manager.getRepository(DoguLicense).findOne({ where: { organizationId } });
    if (!doguLicense) {
      return DEFAULT_CLOUD_LICENSE_DATA;
    }

    const token = doguLicense ? doguLicense.token : '';

    let response;
    try {
      response = await this.getLicenseApiCall({ licenseToken: token, organizationId });
    } catch (error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data;
        const message = data?.message;

        if (error.response?.status === HttpStatus.UNAUTHORIZED) {
          throw new HttpException(`License key is Invaild. organizationId: ${organizationId} licenseToken: ${token}`, HttpStatus.UNAUTHORIZED);
        } else if (error.response?.status === HttpStatus.BAD_REQUEST) {
          throw new HttpException(`License Vaildation Failed. organizationId: ${organizationId} licenseToken: ${token} message: ${message}`, HttpStatus.BAD_REQUEST);
        } else {
          throw new HttpException(
            `License Vaildation Failed. Server Error. organizationId: ${organizationId} licenseToken: ${token} error: ${error}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
      throw new HttpException(`License Vaildation Failed. Server Error.`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const serverLicenseInfo = response.data;
    const licenseInfo = await transformAndValidate(LicenseValidateClass, serverLicenseInfo);
    return licenseInfo;
  }

  async createLicense(manager: EntityManager, dto: CreateLicenseDto): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async setLicense(manager: EntityManager, organizationId: OrganizationId, dto: FindLicenseDtoBase): Promise<LicenseBase> {
    const { licenseToken } = dto;
    const doguLicense = await manager.getRepository(DoguLicense).findOne({ where: { organizationId } });
    if (doguLicense) {
      throw new HttpException(`License is already exist. organizationId: ${organizationId}`, HttpStatus.BAD_REQUEST);
    }
    let response;
    try {
      response = await this.getLicenseApiCall({ licenseToken, organizationId });
    } catch (error) {
      throw new HttpException(`License Vaildation Failed. Server Error. organizationId: ${organizationId} licenseToken: ${licenseToken}`, HttpStatus.BAD_REQUEST);
    }

    const serverLicenseInfo = response.data;
    const licenseInfo = await transformAndValidate(LicenseValidateClass, serverLicenseInfo);
    licenseInfo;

    const doguLicenseId = v4();
    const newData = manager.getRepository(DoguLicense).create({
      doguLicenseId,
      token: licenseToken,
      organizationId,
      type: licenseInfo.type,
    });
    await manager.getRepository(DoguLicense).save(newData);
    return licenseInfo;
  }

  async renewLicense(manager: EntityManager, organizationId: OrganizationId, dto: FindLicenseDtoBase): Promise<LicenseBase> {
    const doguLicense = await this.dataSource.manager.getRepository(DoguLicense).findOne({ where: { organizationId } });
    if (!doguLicense) {
      throw new HttpException(`Current license is not exist.`, HttpStatus.BAD_REQUEST);
    }
    if (doguLicense.token === dto.licenseToken) {
      throw new HttpException(`The license key is already used.`, HttpStatus.BAD_REQUEST);
    }
    await manager.getRepository(DoguLicense).softDelete(doguLicense.doguLicenseId);

    const rv = await this.setLicense(manager, organizationId, dto);
    return rv;
  }

  async deleteLicense(licenseId: LicenseId): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
