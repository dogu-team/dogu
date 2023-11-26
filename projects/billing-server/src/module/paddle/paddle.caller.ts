import {
  BillingCategory,
  BillingCouponType,
  BillingCurrency,
  BillingPeriod,
  BillingReason,
  BillingResult,
  BillingSubscriptionPlanType,
  BillingUsdAmount,
  resultCode,
} from '@dogu-private/console';
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
  category: BillingCategory;
  type: BillingSubscriptionPlanType;
  name: string;
}

export interface UpdateProductOptions {
  productId: string;
  name?: string;
  status?: Paddle.Status;
}

export interface CreatePriceOptions {
  billingSubscriptionPlanSourceId: number;
  currency: BillingCurrency;
  amount: BillingUsdAmount;
  period: BillingPeriod;
  productId: string;
}

export interface UpdatePriceOptions {
  id: string;
  status?: Paddle.Status;
  billingSubscriptionPlanSourceId: number;
  currency?: BillingCurrency;
  amount?: BillingUsdAmount;
  period?: BillingPeriod;
}

interface CreateFailureOptions {
  reason: BillingReason;
  requestId: string | undefined;
  error: Paddle.Error;
}

export interface ListDiscountsResult {
  discounts: Paddle.Discount[];
  hasMore: boolean;
  nextAfter: string | null;
}

export interface CreateDiscountOptions {
  code: string;
  type: BillingCouponType;
  period: BillingPeriod;
  discountPercent: number;
  applyCount: number | null;
  expiredAt: Date | null;
  billingCouponId: string;
}

export interface UpdateDiscountOptions {
  id: string;
  code: string;
  type: BillingCouponType;
  period: BillingPeriod;
  discountPercent: number;
  applyCount: number | null;
  expiredAt: Date | null;
  billingCouponId: string;
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
    const { type, category, name } = options;
    const path = '/products';
    const body = {
      name,
      tax_category: 'saas',
      custom_data: {
        category,
        type,
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
    const { billingSubscriptionPlanSourceId, amount, currency, productId, period } = options;
    const amountInCents = amount.toCents().toString();
    const path = '/prices';
    const body = {
      description: `billingSubscriptionPlanSourceId: ${billingSubscriptionPlanSourceId}`,
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
        billingSubscriptionPlanSourceId,
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
    const { id, status, billingSubscriptionPlanSourceId, currency, amount, period } = options;
    const path = `/prices/${id}`;
    const body = {
      description: `billingSubscriptionPlanSourceId: ${billingSubscriptionPlanSourceId}`,
      status,
      unit_price: {
        amount: amount?.toCents().toString(),
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
        billingSubscriptionPlanSourceId,
      },
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

  /**
   * @see https://developer.paddle.com/api-reference/discounts/list-discounts
   */
  async listDiscounts(after?: string): Promise<BillingResult<ListDiscountsResult>> {
    const path = '/discounts';
    const query = {
      after,
      order_by: 'id[ASC]',
      per_page: 50,
    };

    const response = await this.client.get<Paddle.Response<Paddle.Discount[]>>(path, {
      params: query,
    });
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      return createFailure({
        reason: 'method-paddle-list-discounts-failed',
        requestId: request_id,
        error,
      });
    }

    const discounts = data ?? [];
    const { next, has_more } = meta?.pagination ?? {};
    const nextAfter = new URL(next ?? 'http://localhost').searchParams.get('after');
    return {
      ok: true,
      value: {
        discounts,
        hasMore: has_more ?? false,
        nextAfter,
      },
    };
  }

  async listDiscountsAll(): Promise<BillingResult<Paddle.Discount[]>> {
    const discounts: Paddle.Discount[] = [];
    let nextAfter: string | null = null;
    let hasMore = true;
    while (hasMore) {
      const result: BillingResult<ListDiscountsResult> = await this.listDiscounts(nextAfter ?? undefined);
      if (!result.ok) {
        return result;
      }

      discounts.push(...result.value.discounts);
      nextAfter = result.value.nextAfter;
      hasMore = result.value.hasMore;
    }

    return {
      ok: true,
      value: discounts,
    };
  }

  /**
   * @see https://developer.paddle.com/api-reference/discounts/create-discount
   */
  async createDiscount(options: CreateDiscountOptions): Promise<BillingResult<Paddle.Discount>> {
    const { code, type, period, discountPercent, applyCount, expiredAt, billingCouponId } = options;
    const path = '/discounts';
    const body = {
      type: 'percentage',
      description: `code: ${code}, type: ${type}, period: ${period}, discountPercent: ${discountPercent}, applyCount: ${applyCount}, expiredAt: ${
        expiredAt?.toISOString() ?? null
      }`,
      amount: discountPercent.toString(),
      enabled_for_checkout: true,
      code,
      recur: true,
      maximum_recurring_intervals: applyCount,
      expires_at: expiredAt?.toISOString() ?? null,
      custom_data: {
        billingCouponId,
        type,
        period,
      },
    };

    const response = await this.client.post<Paddle.Response<Paddle.Discount>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      return createFailure({
        reason: 'method-paddle-create-discount-failed',
        requestId: request_id,
        error,
      });
    }

    const discount = data ?? {};
    return {
      ok: true,
      value: discount,
    };
  }

  /**
   * @see https://developer.paddle.com/api-reference/discounts/update-discount
   */
  async updateDiscount(options: UpdateDiscountOptions): Promise<BillingResult<Paddle.Discount>> {
    const { id, code, type, period, discountPercent, applyCount, expiredAt, billingCouponId } = options;
    const path = `/discounts/${id}`;
    const body = {
      type: 'percentage',
      description: `code: ${code}, type: ${type}, period: ${period}, discountPercent: ${discountPercent}, applyCount: ${applyCount}, expiredAt: ${
        expiredAt?.toISOString() ?? null
      }`,
      amount: discountPercent?.toString(),
      code,
      maximum_recurring_intervals: applyCount,
      expires_at: expiredAt?.toISOString() ?? null,
      custom_data: {
        billingCouponId,
        type,
        period,
      },
    };

    const response = await this.client.patch<Paddle.Response<Paddle.Discount>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};
    if (error) {
      return createFailure({
        reason: 'method-paddle-update-discount-failed',
        requestId: request_id,
        error,
      });
    }

    const discount = data ?? {};
    return {
      ok: true,
      value: discount,
    };
  }
}
