import { errorify, setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import _ from 'lodash';
import { FeatureConfig } from '../../feature.config';
import { DoguLogger } from '../logger/logger';

const PaddleBaseUrl = FeatureConfig.get('sandbox') ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';

/**
 * TODO: move to env
 * @description this is sandbox api key
 */
const PaddleApiKey = '7dc2e51c683f1426e5bfa78755c403be85d97f5284740e1c66';

@Injectable()
export class PaddleCaller {
  private readonly client: AxiosInstance;

  constructor(private readonly logger: DoguLogger) {
    const baseUrl = PaddleBaseUrl;

    if (!FeatureConfig.get('sandbox')) {
      this.logger.warn('PaddleCaller is NOT running in sandbox mode!!!', {
        url: baseUrl,
      });
    } else {
      this.logger.warn('PaddleCaller is running in sandbox mode.', {
        url: baseUrl,
      });
    }

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PaddleApiKey}`,
      },
    });
    setAxiosErrorFilterToIntercepter(this.client);
    this.logger.info(`PaddleCaller initialized with ${baseUrl}`);

    this.listEvents().catch((e) => {
      this.logger.error('PaddleCaller.listEvents failed', { error: errorify(e) });
    });
  }

  /**
   * @see https://developer.paddle.com/api-reference/events/list-events
   */
  async listEvents(after: string = ''): Promise<void> {
    const path = '/events';
    const query = {
      order_by: 'status[DESC]',
      per_page: 10,
    };
    if (after) {
      _.set(query, 'after', after);
    }

    this.logger.info('PaddleCaller.listEvents', { path, query });
    const response = await this.client.get(path, {
      params: query,
    });
    const hasMore = _.get(response.data, 'meta.pagination.has_more', false) as boolean;
    const estimatedTotal = _.get(response.data, 'meta.pagination.estimated_total', 0) as number;
    const next = _.get(response.data, 'meta.pagination.next', '') as string;
    this.logger.info('PaddleCaller.listEvents response', { path, query, hasMore, estimatedTotal, next });
  }
}
