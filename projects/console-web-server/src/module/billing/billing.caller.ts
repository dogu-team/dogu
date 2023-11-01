import { setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { updateAuthHeaderByBillingApiToken } from '../../enterprise/module/license/common/utils';
import { env } from '../../env';
import { FeatureConfig } from '../../feature.config';
import { DoguLogger } from '../logger/logger';

const BillingServerUrl = env.DOGU_BILLING_SERVER_URL.endsWith('/') ? env.DOGU_BILLING_SERVER_URL.slice(0, -1) : env.DOGU_BILLING_SERVER_URL;

@Injectable()
export class BillingCaller {
  private readonly api: AxiosInstance;

  constructor(private readonly logger: DoguLogger) {
    this.api = axios.create({
      baseURL: BillingServerUrl,
    });
    setAxiosErrorFilterToIntercepter(this.api);
    this.logger.debug(`BillingCaller initialized with ${BillingServerUrl}`);

    if (FeatureConfig.get('licenseModule') === 'cloud') {
      updateAuthHeaderByBillingApiToken(this.api.defaults.headers);
    }
  }
}
