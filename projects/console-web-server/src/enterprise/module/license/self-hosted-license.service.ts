import { COMMUNITY_LICENSE_KEY, COMMUNITY_MAX_BROWSER_COUNT, COMMUNITY_MAX_MOBILE_COUNT, SelfHostedLicenseBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import axios from 'axios';
import { DataSource } from 'typeorm';

import { env } from '../../../env';
import { DoguLogger } from '../../../module/logger/logger';

@Injectable()
export class SelfHostedLicenseService {
  private readonly api: axios.AxiosInstance;
  private readonly defaultLicense: SelfHostedLicenseBase = {
    selfHostedLicenseId: '00000000-0000-0000-0000-000000000000',
    organizationId: '00000000-0000-0000-0000-000000000000',
    billingOrganizationId: '00000000-0000-0000-0000-000000000000',
    licenseKey: COMMUNITY_LICENSE_KEY,
    category: 'self-hosted',
    openApiEnabled: false,
    doguAgentAutoUpdateEnabled: false,
    maximumEnabledBrowserCount: COMMUNITY_MAX_BROWSER_COUNT,
    maximumEnabledMobileCount: COMMUNITY_MAX_MOBILE_COUNT,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastAccessAt: new Date(),
    expiredAt: new Date('9999-12-31T23:59:59.999Z'),
    deletedAt: null,
  };

  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.api = axios.create({
      baseURL: env.DOGU_BILLING_SERVER_URL,
    });
    setAxiosErrorFilterToIntercepter(this.api);
  }

  async setLicense(organizationId: OrganizationId, licenseKey: string): Promise<SelfHostedLicenseBase> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new NotImplementedException('Self hosted not implemented yet');
    // try {
    //   const response = await this.api.get<SelfHostedLicenseBase>(`/self-hosted-licenses`, {
    //     headers: updateAuthHeaderBySelfHostedLicense(this.api.defaults.headers, organizationId, licenseKey),
    //   });

    //   await this.dataSource.transaction(async (manager) => {
    //     const existingLicense = await manager.getRepository(DoguLicense).createQueryBuilder('doguLicense').getOne();
    //     if (existingLicense) {
    //       await manager.getRepository(DoguLicense).softRemove(existingLicense);
    //     }
    //     const license = manager.getRepository(DoguLicense).create({ doguLicenseId: v4(), licenseKey });
    //     await manager.getRepository(DoguLicense).save(license);
    //   });

    //   return response.data;
    // } catch (e) {
    //   if ((e as FilteredAxiosError).responseStatus === 404) {
    //     throw new NotFoundException(`Your organization does not have a self-hosted license. organizationId: ${organizationId}, licenseKey: ${licenseKey}`);
    //   }
    //   throw e;
    // }
  }

  async getLicenseInfo(organizationId: OrganizationId): Promise<SelfHostedLicenseBase> {
    // const license = await this.dataSource.getRepository(DoguLicense).createQueryBuilder('doguLicense').getOne();

    // if (!license) {
    //   return this.defaultLicense;
    // }

    // try {
    //   const response = await this.api.get<SelfHostedLicenseBase>(`/self-hosted-licenses`, {
    //     headers: updateAuthHeaderBySelfHostedLicense(this.api.defaults.headers, organizationId, license.licenseKey),
    //   });
    //   return response.data;
    // } catch (e) {
    //   this.logger.error(`Failed to get license info from billing server. organizationId: ${organizationId}, licenseKey: ${license?.licenseKey}`, {
    //     error: e,
    //   });
    //   return this.defaultLicense;
    // }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new NotImplementedException('Self hosted not implemented yet');
  }
}
