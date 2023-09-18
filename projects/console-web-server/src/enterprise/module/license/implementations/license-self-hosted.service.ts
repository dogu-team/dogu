import { CreateLicenseDto, DEFAULT_SELF_HOSTED_LICENSE_DATA, DoguLicenseId, FindLicenseWithSelfHostedDto, LicenseResponse, LicenseValidateClass } from '@dogu-private/console';
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

  private async getLicenseApiWithException(dto: FindLicenseWithSelfHostedDto): Promise<LicenseResponse> {
    const { licenseToken, companyName } = dto;

    try {
      const response = await this.getLicenseApiCall({ licenseToken, companyName: this.companyName });
      const serverLicenseInfo = response.data;
      const licenseInfo = await transformAndValidate(LicenseValidateClass, serverLicenseInfo);
      return {
        ...licenseInfo,
        errorInfo: null,
        isCommunityEdition: false,
        consoleRegisteredToken: licenseToken,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data;
        const message = data?.message;

        if (error.response?.status === HttpStatus.UNAUTHORIZED) {
          return {
            ...DEFAULT_SELF_HOSTED_LICENSE_DATA,
            errorInfo: {
              isTokenInValid: true,
              isLicenseServerDisConnected: false,
              unKnownError: false,
            },
            isCommunityEdition: false,
            consoleRegisteredToken: licenseToken,
          };
        } else if (error.response?.status === HttpStatus.REQUEST_TIMEOUT) {
          return {
            ...DEFAULT_SELF_HOSTED_LICENSE_DATA,
            errorInfo: {
              isTokenInValid: false,
              isLicenseServerDisConnected: true,
              unKnownError: false,
            },
            isCommunityEdition: false,
            consoleRegisteredToken: licenseToken,
          };
        } else if (error.code === 'ECONNREFUSED') {
          return {
            ...DEFAULT_SELF_HOSTED_LICENSE_DATA,
            errorInfo: {
              isTokenInValid: false,
              isLicenseServerDisConnected: true,
              unKnownError: false,
            },
            isCommunityEdition: false,
            consoleRegisteredToken: licenseToken,
          };
        } else if (error.code === 'ENOTFOUND') {
          return {
            ...DEFAULT_SELF_HOSTED_LICENSE_DATA,
            errorInfo: {
              isTokenInValid: false,
              isLicenseServerDisConnected: true,
              unKnownError: false,
            },
            isCommunityEdition: false,
            consoleRegisteredToken: licenseToken,
          };
        } else if (error.response?.status === HttpStatus.BAD_REQUEST) {
          throw new HttpException(`License Vaildation Failed. companyName: ${this.companyName} licenseToken: ${licenseToken} message: ${message}`, HttpStatus.BAD_REQUEST);
        } else {
          throw new HttpException(`License Vaildation Failed. Server Error(AxiosError).`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      throw new HttpException(`License Vaildation Failed. Server Error.`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getLicense(organizationId: OrganizationId | null): Promise<LicenseResponse> {
    const doguLicense = await this.dataSource.manager.getRepository(DoguLicense).findOne({ where: { companyName: this.companyName } });
    if (!doguLicense) {
      return {
        ...DEFAULT_SELF_HOSTED_LICENSE_DATA,
        errorInfo: null,
        isCommunityEdition: true,
        consoleRegisteredToken: null,
      };
    }

    const licenseInfo = await this.getLicenseApiWithException({ licenseToken: doguLicense.token, companyName: this.companyName });
    return licenseInfo;
  }

  async setLicense(manager: EntityManager, dto: FindLicenseWithSelfHostedDto): Promise<LicenseResponse> {
    const { licenseToken } = dto;
    const doguLicense = await manager.getRepository(DoguLicense).findOne({ where: { companyName: this.companyName } });
    if (doguLicense) {
      throw new HttpException(`License is already exist. companyName: ${this.companyName}`, HttpStatus.BAD_REQUEST);
    }

    const licenseInfo = await this.getLicenseApiWithException({ licenseToken, companyName: this.companyName });
    if (licenseInfo.errorInfo) {
      throw new HttpException(`License is not valid or license server is not connected. companyName: ${this.companyName}`, HttpStatus.BAD_REQUEST);
    }
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

  async renewLicense(manager: EntityManager, dto: FindLicenseWithSelfHostedDto): Promise<LicenseResponse> {
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
