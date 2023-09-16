import { CreateLicenseDto, DEFAULT_SELF_HOSTED_LICENSE_DATA, DoguLicenseId, FindLicenseWithSelfHostedDto, LicenseBase, LicenseValidateClass } from '@dogu-private/console';
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
export class LicenseSelfHostedService extends FeatureLicenseService {
  private readonly licenseServerUrl = config.license.url;
  private readonly companyName = config.license.companyName;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super('self-hosted');
  }

  @Retry()
  private async getLicenseApiCall(dto: FindLicenseWithSelfHostedDto) {
    const { licenseToken, companyName } = dto;
    const query = new URLSearchParams({
      companyName,
    });

    const response = await axios.get(`${this.licenseServerUrl}/licenses/?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${licenseToken}`,
      },
    });
    return response;
  }

  private async getLicenseApiWithException(dto: FindLicenseWithSelfHostedDto) {
    const { licenseToken, companyName } = dto;
    try {
      const response = await this.getLicenseApiCall({ licenseToken, companyName: this.companyName });
      return response;
    } catch (error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data;
        const message = data?.message;

        if (error.response?.status === HttpStatus.UNAUTHORIZED) {
          throw new HttpException(`License key is Invaild. companyName: ${this.companyName} licenseToken: ${licenseToken}`, HttpStatus.UNAUTHORIZED);
        } else if (error.response?.status === HttpStatus.BAD_REQUEST) {
          throw new HttpException(`License Vaildation Failed. companyName: ${this.companyName} licenseToken: ${licenseToken} message: ${message}`, HttpStatus.BAD_REQUEST);
        } else if (error.response?.status === HttpStatus.REQUEST_TIMEOUT) {
          throw new HttpException(
            `Dogu License Server connection timeout. Please check dogu license server connection. Dogu License Url : ${this.licenseServerUrl}`,
            HttpStatus.REQUEST_TIMEOUT,
          );
        } else if (error.code === 'ECONNREFUSED') {
          throw new HttpException(
            `Dogu License Server connection failed. Please check dogu license  server connection. Dogu License Url : ${this.licenseServerUrl}`,
            HttpStatus.REQUEST_TIMEOUT,
          );
        } else if (error.code === 'ENOTFOUND') {
          throw new HttpException(
            `Dogu License Server connection failed. Please check dogu license  server connection. Dogu License Url : ${this.licenseServerUrl}`,
            HttpStatus.REQUEST_TIMEOUT,
          );
        } else {
          throw new HttpException(
            `License Vaildation Failed. Server Error. companyName: ${this.companyName} licenseToken: ${licenseToken} error: ${error}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
      throw new HttpException(`License Vaildation Failed. Server Error.`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getLicense(organizationId: OrganizationId | null): Promise<LicenseBase> {
    const doguLicense = await this.dataSource.manager.getRepository(DoguLicense).findOne({ where: { companyName: this.companyName } });
    if (!doguLicense) {
      return DEFAULT_SELF_HOSTED_LICENSE_DATA;
    }

    const token = doguLicense ? doguLicense.token : '';

    const response = await this.getLicenseApiWithException({ licenseToken: token, companyName: this.companyName });

    const serverLicenseInfo = response.data;
    const licenseInfo = await transformAndValidate(LicenseValidateClass, serverLicenseInfo);
    return licenseInfo;
  }

  async setLicense(manager: EntityManager, dto: FindLicenseWithSelfHostedDto): Promise<LicenseBase> {
    const { licenseToken } = dto;
    const doguLicense = await manager.getRepository(DoguLicense).findOne({ where: { companyName: this.companyName } });
    if (doguLicense) {
      throw new HttpException(`License is already exist. companyName: ${this.companyName}`, HttpStatus.BAD_REQUEST);
    }

    const response = await this.getLicenseApiWithException({ licenseToken, companyName: this.companyName });

    const serverLicenseInfo = response.data;
    const licenseInfo = await transformAndValidate(LicenseValidateClass, serverLicenseInfo);
    licenseInfo;

    const doguLicenseId = v4();
    const newData = manager.getRepository(DoguLicense).create({
      doguLicenseId,
      token: licenseToken,
      companyName: this.companyName,
      type: licenseInfo.type,
    });
    await manager.getRepository(DoguLicense).save(newData);
    return licenseInfo;
  }

  async createLicense(manager: EntityManager, dto: CreateLicenseDto): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async renewLicense(manager: EntityManager, dto: FindLicenseWithSelfHostedDto): Promise<LicenseBase> {
    const doguLicense = await this.dataSource.manager.getRepository(DoguLicense).findOne({ where: { companyName: this.companyName } });
    if (!doguLicense) {
      throw new HttpException(`Current license is not exist.`, HttpStatus.BAD_REQUEST);
    }
    if (doguLicense.token === dto.licenseToken) {
      throw new HttpException(`The license key is already used.`, HttpStatus.BAD_REQUEST);
    }
    await manager.getRepository(DoguLicense).softDelete(doguLicense.doguLicenseId);

    const rv = await this.setLicense(manager, dto);
    return rv;
  }

  async deleteLicense(doguLicenseId: DoguLicenseId): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
