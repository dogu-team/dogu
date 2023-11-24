import { BillingCategory, BillingCurrency, BillingPeriod, BillingReason, BillingResult, BillingSubscriptionPlanType, BillingUsdAmount, resultCode } from '@dogu-private/console';
import { setAxiosFilterErrorAndLogging } from '@dogu-tech/common';
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

export interface UpdateProductOptions {
  productId: string;
  name?: string;
  status?: Paddle.Status;
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

export interface UpdatePriceOptions {
  priceId: string;
  status: Paddle.Status;
}

interface CreateFailureOptions {
  reason: BillingReason;
  requestId: string | undefined;
  error: Paddle.Error;
}

function createFailure<T>(options: CreateFailureOptions): BillingResult<T> {
  const { reason, requestId, error } = options;
  return {
    ok: false,
    resultCode: resultCode(reason, {
      requestId,
      errorType: error.type,
      errorCode: error.code,
      errorDetail: error.detail,
      errorDocumentationUrl: error.documentation_url,
    }),
  };
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
    setAxiosFilterErrorAndLogging(PaddleCaller.name, this.client, this.logger);
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

    const response = await this.client.get<Paddle.Response<Paddle.Event[]>>(path, {
      params: query,
    });
    const { error, data, meta } = response.data;
    const { request_id, pagination } = meta ?? {};

    if (error) {
      return createFailure({
        reason: 'method-paddle-list-events-failed',
        requestId: request_id,
        error,
      });
    }

    const events = data ?? [];
    const { next, has_more, estimated_total } = pagination ?? {};
    const nextAfter = new URL(next ?? 'http://localhost').searchParams.get('after');
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

    const response = await this.client.post<Paddle.Response<Paddle.Customer>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
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

    const response = await this.client.get<Paddle.Response<Paddle.Customer>>(path);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      return createFailure({
        reason: 'method-paddle-get-customer-failed',
        requestId: request_id,
        error,
      });
    }

    const customer = data ?? {};
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

    const response = await this.client.patch<Paddle.Response<Paddle.Customer>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      return createFailure({
        reason: 'method-paddle-update-customer-failed',
        requestId: request_id,
        error,
      });
    }

    const customer = data ?? {};
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
      per_page: 10,
      after,
      include: 'prices',
      status: 'active',
    };

    const response = await this.client.get<Paddle.Response<Paddle.Product[]>>(path, {
      params: query,
    });
    const { error, data, meta } = response.data;
    const { request_id, pagination } = meta ?? {};

    if (error) {
      return createFailure({
        reason: 'method-paddle-list-products-failed',
        requestId: request_id,
        error,
      });
    }

    const products = data ?? [];
    const { next, has_more } = pagination ?? {};
    const nextAfter = new URL(next ?? 'http://localhost').searchParams.get('after');
    return {
      ok: true,
      value: {
        products,
        hasMore: has_more ?? false,
        nextAfter,
      },
    };
  }

  async listProductsAll(): Promise<BillingResult<Paddle.ProductWithPrices[]>> {
    const products: Paddle.ProductWithPrices[] = [];
    let nextAfter: string | null = null;
    let hasMore = true;
    while (hasMore) {
      const result: BillingResult<ListProductsResult> = await this.listProducts(nextAfter ?? undefined);
      if (!result.ok) {
        return result;
      }

      products.push(...result.value.products);
      nextAfter = result.value.nextAfter;
      hasMore = result.value.hasMore;
    }

    return {
      ok: true,
      value: products,
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

    const response = await this.client.post<Paddle.Response<Paddle.Product>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      return createFailure({
        reason: 'method-paddle-create-product-failed',
        requestId: request_id,
        error,
      });
    }

    const product = data ?? {};
    return {
      ok: true,
      value: product,
    };
  }

  /**
   * @see https://developer.paddle.com/api-reference/products/update-product
   */
  async updateProduct(options: UpdateProductOptions): Promise<BillingResult<Paddle.Product>> {
    const { productId, status } = options;
    const path = `/products/${productId}`;
    const body = {
      status,
    };

    const response = await this.client.patch<Paddle.Response<Paddle.Product>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      return createFailure({
        reason: 'method-paddle-update-product-failed',
        requestId: request_id,
        error,
      });
    }

    const product = data ?? {};
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

    const response = await this.client.post<Paddle.Response<Paddle.Price>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      return createFailure({
        reason: 'method-paddle-create-price-failed',
        requestId: request_id,
        error,
      });
    }

    const price = data ?? {};
    return {
      ok: true,
      value: price,
    };
  }

  /**
   * @see https://developer.paddle.com/api-reference/prices/update-price
   */
  async updatePrice(options: UpdatePriceOptions): Promise<BillingResult<Paddle.Price>> {
    const { priceId, status } = options;
    const path = `/prices/${priceId}`;
    const body = {
      status,
    };

    const response = await this.client.patch<Paddle.Response<Paddle.Price>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};
    if (error) {
      return createFailure({
        reason: 'method-paddle-update-price-failed',
        requestId: request_id,
        error,
      });
    }

    const price = data ?? {};
    return {
      ok: true,
      value: price,
    };
  }
}
