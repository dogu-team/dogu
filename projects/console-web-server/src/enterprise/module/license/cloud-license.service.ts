import { CloudLicenseBase, CreateCloudLicenseDto } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { env } from '../../../env';

@Injectable()
export class CloudLicenseService {
  private readonly api: axios.AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: env.DOGU_BILLING_SERVER_URL,
    });
    setAxiosErrorFilterToIntercepter(this.api);
  }

  async createLicense(dto: CreateCloudLicenseDto): Promise<CloudLicenseBase> {
    try {
      const response = await this.api.post<CloudLicenseBase>('/cloud-licenses', dto);
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  async getLicenseInfo(organizationId: OrganizationId): Promise<CloudLicenseBase> {
    try {
      const response = await this.api.get<CloudLicenseBase>(`/cloud-licenses/${organizationId}`);
      return response.data;
    } catch (e) {
      throw e;
    }
  }
}
