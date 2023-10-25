import { SelfHostedLicenseBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { env } from '../../../env';

@Injectable()
export class SelfHostedLicenseService {
  private readonly api = axios.create({
    baseURL: env.DOGU_BILLING_SERVER_URL,
  });

  async setLicense() {}

  async getLicenseInfo(organizationId: OrganizationId): Promise<SelfHostedLicenseBase> {
    try {
      const response = await this.api.get<SelfHostedLicenseBase>(`/self-hosted-licenses/${organizationId}`);
      return response.data;
    } catch (e) {
      throw e;
    }
  }
}
