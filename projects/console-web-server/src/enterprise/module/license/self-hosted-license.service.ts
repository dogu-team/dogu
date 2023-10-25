import { COMMUNITY_LICENSE_KEY, COMMUNITY_MAX_BROWSER_COUNT, COMMUNITY_MAX_MOBILE_COUNT, SelfHostedLicenseBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { DoguLicense } from '../../../db/entity/dogu-license.enitiy';
import { env } from '../../../env';
import { DoguLogger } from '../../../module/logger/logger';

@Injectable()
export class SelfHostedLicenseService {
  private readonly api: axios.AxiosInstance;
  private readonly defaultLicense: SelfHostedLicenseBase = {
    selfHostedLicenseId: 'default',
    organizationId: 'default',
    companyName: 'default',
    licenseKey: COMMUNITY_LICENSE_KEY,
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
    try {
      const response = await this.api.post<SelfHostedLicenseBase>('/self-hosted-licenses', {
        organizationId,
        licenseKey,
      });

      await this.dataSource.transaction(async (manager) => {
        const existingLicense = await manager.getRepository(DoguLicense).createQueryBuilder('doguLicense').getOne();
        if (existingLicense) {
          await manager.getRepository(DoguLicense).softRemove(existingLicense);
        }
        const license = manager.getRepository(DoguLicense).create({ doguLicenseId: v4(), licenseKey });
        await manager.getRepository(DoguLicense).save(license);
      });

      return response.data;
    } catch (e) {
      throw e;
    }
  }

  async getLicenseInfo(organizationId: OrganizationId): Promise<SelfHostedLicenseBase> {
    const license = await this.dataSource.getRepository(DoguLicense).createQueryBuilder('doguLicense').getOne();

    if (!license) {
      return this.defaultLicense;
    }

    try {
      const response = await this.api.get<SelfHostedLicenseBase>(`/self-hosted-licenses?organizationId=${organizationId}&licenseKey=${license?.licenseKey}`);
      return response.data;
    } catch (e) {
      this.logger.error(`Failed to get license info from billing server. organizationId: ${organizationId}, licenseKey: ${license?.licenseKey}`, {
        error: e,
      });
      return this.defaultLicense;
    }
  }
}
