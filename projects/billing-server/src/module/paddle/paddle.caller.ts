import { BillingCategory, BillingCurrency, BillingPeriod, BillingResult, BillingSubscriptionPlanType, BillingUsdAmount, resultCode } from '@dogu-private/console';
import { setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { FeatureConfig } from '../../feature.config';
import { DoguLogger } from '../logger/logger';
import { Paddle } from './paddle.types';

const PaddleBaseUrl = FeatureConfig.get('sandbox') ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';

/**
 * TODO: move to env
 * @description this is sandbox api key
 */
const PaddleApiKey = '7dc2e51c683f1426e5bfa78755c403be85d97f5284740e1c66';

export interface CreateCustomerOptions {
  organizationId: string;
  email: string;
}

export interface GetCustomerOptions {
  customerId: string;
}

export interface UpdateCustomerOptions {
  customerId: string;
  email: string;
}

export interface ListEventsResult {
  events: Paddle.Event[];
  nextAfter: string | null;
}

export interface ListProductsResult {
  products: Paddle.ProductWithPrices[];
  hasMore: boolean;
  nextAfter: string | null;
}

export interface CreateProductOptions {
  subscriptionPlanType: BillingSubscriptionPlanType;
  category: BillingCategory;
  name: string;
}

export interface CreatePriceOptions {
  category: BillingCategory;
  subscriptionPlanType: BillingSubscriptionPlanType;
  option: string;
  period: BillingPeriod;
  currency: BillingCurrency;
  amount: BillingUsdAmount;
  billingOrganizationId: string;
  productId: string;
}

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
  }

  /**
   * @see https://developer.paddle.com/api-reference/events/list-events
   */
  async listEvents(after?: string): Promise<BillingResult<ListEventsResult>> {
    const path = '/events';
    const query = {
      order_by: 'id[ASC]',
      per_page: 50,
      after,
    };
    this.logger.info('PaddleCaller.listEvents', { path, query });

    const response = await this.client.get<Paddle.Response<Paddle.Event[]>>(path, {
      params: query,
    });
    const { error, data, meta } = response.data;
    const { request_id, pagination } = meta ?? {};

    if (error) {
      this.logger.error('PaddleCaller.listEvents failed', { path, query, error });
      return {
        ok: false,
        resultCode: resultCode('method-paddle-list-events-failed', {
          requestId: request_id,
          errorType: error.type,
          errorCode: error.code,
          errorDetail: error.detail,
          errorDocumentationUrl: error.documentation_url,
        }),
      };
    }

    const events = data ?? [];
    const { next, has_more, estimated_total } = pagination ?? {};
    const nextAfter = new URL(next ?? 'http://localhost').searchParams.get('after');
    this.logger.info('PaddleCaller.listEvents response', { request_id, has_more, estimated_total, nextAfter });
    return {
      ok: true,
      value: {
        events,
        nextAfter,
      },
    };
  }

  /**
   * @see https://developer.paddle.com/api-reference/customers/create-customer
   */
  async createCustomer(options: CreateCustomerOptions): Promise<BillingResult<Paddle.Customer>> {
    const { organizationId, email } = options;
    const path = '/customers';
    const body = {
      email,
      custom_data: {
        organizationId,
      },
    };
    this.logger.info('PaddleCaller.createCustomer', { path, body });

    const response = await this.client.post<Paddle.Response<Paddle.Customer>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      this.logger.error('PaddleCaller.createCustomer failed', { path, body, error });
      return {
        ok: false,
        resultCode: resultCode('method-paddle-create-customer-failed', {
          requestId: request_id,
          errorType: error.type,
          errorCode: error.code,
          errorDetail: error.detail,
          errorDocumentationUrl: error.documentation_url,
        }),
      };
    }

    const customer = data ?? {};
    this.logger.info('PaddleCaller.createCustomer response', { request_id, customer });
    return {
      ok: true,
      value: customer,
    };
  }

  /**
   * @see https://developer.paddle.com/api-reference/customers/get-customer
   */
  async getCustomer(options: GetCustomerOptions): Promise<BillingResult<Paddle.Customer>> {
    const { customerId } = options;
    const path = `/customers/${customerId}`;
    this.logger.info('PaddleCaller.getCustomer', { path });

    const response = await this.client.get<Paddle.Response<Paddle.Customer>>(path);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      this.logger.error('PaddleCaller.getCustomer failed', { path, error });
      return {
        ok: false,
        resultCode: resultCode('method-paddle-get-customer-failed', {
          requestId: request_id,
          errorType: error.type,
          errorCode: error.code,
          errorDetail: error.detail,
          errorDocumentationUrl: error.documentation_url,
        }),
      };
    }

    const customer = data ?? {};
    this.logger.info('PaddleCaller.getCustomer response', { request_id, customer });
    return {
      ok: true,
      value: customer,
    };
  }

  /**
   * @see https://developer.paddle.com/api-reference/customers/update-customer
   */
  async updateCustomer(options: UpdateCustomerOptions): Promise<BillingResult<Paddle.Customer>> {
    const { customerId, email } = options;
    const path = `/customers/${customerId}`;
    const body = {
      email,
    };
    this.logger.info('PaddleCaller.updateCustomer', { path, body });

    const response = await this.client.patch<Paddle.Response<Paddle.Customer>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      this.logger.error('PaddleCaller.updateCustomer failed', { path, body, error });
      return {
        ok: false,
        resultCode: resultCode('method-paddle-update-customer-failed', {
          requestId: request_id,
          errorType: error.type,
          errorCode: error.code,
          errorDetail: error.detail,
          errorDocumentationUrl: error.documentation_url,
        }),
      };
    }

    const customer = data ?? {};
    this.logger.info('PaddleCaller.updateCustomer response', { request_id, customer });
    return {
      ok: true,
      value: customer,
    };
  }

  /**
   * @see https://developer.paddle.com/api-reference/products/list-products
   */
  async listProducts(after?: string): Promise<BillingResult<ListProductsResult>> {
    const path = '/products';
    const query = {
      order_by: 'id[ASC]',
      per_page: 50,
      after,
      include: 'prices',
      status: 'active',
    };
    this.logger.info('PaddleCaller.listProducts', { path, query });

    const response = await this.client.get<Paddle.Response<Paddle.Product[]>>(path, {
      params: query,
    });
    const { error, data, meta } = response.data;
    const { request_id, pagination } = meta ?? {};

    if (error) {
      this.logger.error('PaddleCaller.listProducts failed', { path, query, error });
      return {
        ok: false,
        resultCode: resultCode('method-paddle-list-products-failed', {
          requestId: request_id,
          errorType: error.type,
          errorCode: error.code,
          errorDetail: error.detail,
          errorDocumentationUrl: error.documentation_url,
        }),
      };
    }

    const products = data ?? [];
    const { next, has_more, estimated_total } = pagination ?? {};
    const nextAfter = new URL(next ?? 'http://localhost').searchParams.get('after');
    this.logger.info('PaddleCaller.listProducts response', { request_id, has_more, estimated_total, nextAfter });
    return {
      ok: true,
      value: {
        products,
        hasMore: has_more ?? false,
        nextAfter,
      },
    };
  }

  /**
   * @see https://developer.paddle.com/api-reference/products/create-product
   */
  async createProduct(options: CreateProductOptions): Promise<BillingResult<Paddle.Product>> {
    const { subscriptionPlanType, category, name } = options;
    const path = '/products';
    const body = {
      name,
      tax_category: 'saas',
      custom_data: {
        subscriptionPlanType,
        category,
      },
    };
    this.logger.info('PaddleCaller.createProduct', { path, body });

    const response = await this.client.post<Paddle.Response<Paddle.Product>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      this.logger.error('PaddleCaller.createProduct failed', { path, body, error });
      return {
        ok: false,
        resultCode: resultCode('method-paddle-create-product-failed', {
          requestId: request_id,
          errorType: error.type,
          errorCode: error.code,
          errorDetail: error.detail,
          errorDocumentationUrl: error.documentation_url,
        }),
      };
    }

    const product = data ?? {};
    this.logger.info('PaddleCaller.createProduct response', { request_id, product });
    return {
      ok: true,
      value: product,
    };
  }

  /**
   * @see https://developer.paddle.com/api-reference/prices/create-price
   */
  async createPrice(options: CreatePriceOptions): Promise<BillingResult<Paddle.Price>> {
    const { category, subscriptionPlanType, option, period, currency, amount, billingOrganizationId, productId } = options;
    const amountInCents = amount.toCents().toString();
    const path = '/prices';
    const body = {
      description: `${category},${subscriptionPlanType},${option},${period},${currency},${amountInCents},${productId}`,
      product_id: productId,
      unit_price: {
        amount: amountInCents,
        currency_code: currency,
      },
      billing_cycle: {
        interval: period === 'monthly' ? 'month' : 'year',
        frequency: 1,
      },
      quantity: {
        minimum: 1,
        maximum: 1,
      },
      custom_data: {
        category,
        subscriptionPlanType,
        option,
        period,
        currency,
        amountInCents,
        billingOrganizationId,
      },
    };
    this.logger.info('PaddleCaller.createPrice', { path, body });

    const response = await this.client.post<Paddle.Response<Paddle.Price>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      this.logger.error('PaddleCaller.createPrice failed', { path, body, error });
      return {
        ok: false,
        resultCode: resultCode('method-paddle-create-price-failed', {
          requestId: request_id,
          errorType: error.type,
          errorCode: error.code,
          errorDetail: error.detail,
          errorDocumentationUrl: error.documentation_url,
        }),
      };
    }

    const price = data ?? {};
    this.logger.info('PaddleCaller.createPrice response', { request_id, price });
    return {
      ok: true,
      value: price,
    };
  }
}
