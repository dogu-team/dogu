import { BillingCategory, BillingCouponType, BillingCurrency, BillingPeriod, BillingPlanType, BillingUsdAmount } from '@dogu-private/console';
import { setAxiosFilterErrorAndLogging } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { FeatureConfig } from '../../feature.config';
import { DoguLogger } from '../logger/logger';
import { Paddle } from './paddle.types';
import { matchDiscount, matchPrice } from './paddle.utils';

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

interface ListOptions {
  after?: string;
}

interface ListResult<T> {
  items: T[];
  hasMore: boolean;
  nextAfter: string | null;
}

export type ListEventsResult = ListResult<Paddle.Event>;
export type ListProductsResult = ListResult<Paddle.ProductWithPrices>;

export interface ListProductsAllOptions {
  refresh: boolean;
}

export interface CreateProductOptions {
  category: BillingCategory;
  type: BillingPlanType;
  name: string;
}

export interface UpdateProductOptions {
  productId: string;
  name?: string;
  status?: Paddle.Status;
}

export interface CreatePriceOptions {
  billingPlanSourceId: number;
  currency: BillingCurrency;
  amount: BillingUsdAmount;
  period: BillingPeriod;
  productId: string;
}

export interface UpdatePriceOptions {
  id: string;
  status?: Paddle.Status;
  billingPlanSourceId: number;
  currency?: BillingCurrency;
  amount?: BillingUsdAmount;
  period?: BillingPeriod;
}

export interface FindPriceOptions {
  billingPlanSourceId: number;
}

export type ListDiscountsResult = ListResult<Paddle.Discount>;

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

export interface FindDiscountOptions {
  billingCouponId: string;
}

export interface ListSubscriptionsOptions extends ListOptions {
  customerId?: string;
}

export type ListSubscriptionsResult = ListResult<Paddle.Subscription>;

export interface FindSubscriptionOptions {
  customerId: string;
  billingPlanInfoId: string;
}

export interface GetSubscriptionOptions {
  subscriptionId: string;
}

export interface GetUpdatePaymentMethodTransactionOptions {
  subscriptionId: string;
}

export interface ListAddressesOptions extends ListOptions {
  customerId: string;
}

export type ListAddressesResult = ListResult<Paddle.Address>;

export interface UpdateAddressOptions extends Omit<Paddle.Address, 'id' | 'created_at' | 'updated_at'> {
  customerId: string;
  addressId: string;
}

export class PaddleError extends Error {
  constructor(
    message: string,
    readonly requestId: string | undefined,
    readonly error: Paddle.Error,
  ) {
    super(`${message} requestId: ${requestId} error: ${JSON.stringify(error)}`);
  }
}

function processPaddleListResponse<T>(paddleResponse: Paddle.Response<T[]>, errorMessage: string): ListResult<T> {
  const { error, data, meta } = paddleResponse;
  const { request_id, pagination } = meta ?? {};

  if (error) {
    throw new PaddleError(errorMessage, request_id, error);
  }

  const items = data ?? [];
  const { next, has_more } = pagination ?? {};
  const nextAfter = new URL(next ?? 'http://localhost').searchParams.get('after');
  return {
    items,
    hasMore: has_more ?? false,
    nextAfter,
  };
}

@Injectable()
export class PaddleCaller {
  private readonly client: AxiosInstance;
  private cacheProducts: Paddle.ProductWithPrices[] = [];

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
  async listEvents(after?: string): Promise<ListEventsResult> {
    const path = '/events';
    const query = {
      order_by: 'id[ASC]',
      per_page: 50,
      after,
    };

    const response = await this.client.get<Paddle.Response<Paddle.Event[]>>(path, {
      params: query,
    });
    return processPaddleListResponse(response.data, 'list events failed');
  }

  /**
   * @see https://developer.paddle.com/api-reference/customers/create-customer
   */
  async createCustomer(options: CreateCustomerOptions): Promise<Paddle.Customer> {
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
      throw new PaddleError('create customer failed', request_id, error);
    }

    const customer = data ?? {};
    return customer;
  }

  /**
   * @see https://developer.paddle.com/api-reference/customers/get-customer
   */
  async getCustomer(options: GetCustomerOptions): Promise<Paddle.Customer> {
    const { customerId } = options;
    const path = `/customers/${customerId}`;

    const response = await this.client.get<Paddle.Response<Paddle.Customer>>(path);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      throw new PaddleError('get customer failed', request_id, error);
    }

    const customer = data ?? {};
    return customer;
  }

  /**
   * @see https://developer.paddle.com/api-reference/customers/update-customer
   */
  async updateCustomer(options: UpdateCustomerOptions): Promise<Paddle.Customer> {
    const { customerId, email } = options;
    const path = `/customers/${customerId}`;
    const body = {
      email,
    };

    const response = await this.client.patch<Paddle.Response<Paddle.Customer>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      throw new PaddleError('update customer failed', request_id, error);
    }

    const customer = data ?? {};
    return customer;
  }

  /**
   * @see https://developer.paddle.com/api-reference/products/list-products
   */
  async listProducts(options: ListOptions): Promise<ListProductsResult> {
    const { after } = options;
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
    return processPaddleListResponse(response.data, 'list products failed');
  }

  private async listAll<O extends ListOptions, R>(options: O, list: (options: O) => Promise<ListResult<R>>): Promise<R[]> {
    const items: R[] = [];
    let nextAfter: string | null = null;
    let hasMore = true;
    while (hasMore) {
      const result: ListResult<R> = await list({ ...options, after: nextAfter ?? undefined });
      items.push(...result.items);
      nextAfter = result.nextAfter;
      hasMore = result.hasMore;
    }

    return items;
  }

  async listProductsAllAndCache(options: ListProductsAllOptions): Promise<Paddle.ProductWithPrices[]> {
    const { refresh } = options;

    const cache = async (): Promise<void> => {
      const products = await this.listAll({}, async (options) => this.listProducts(options));
      this.cacheProducts = products;
    };

    if (this.cacheProducts.length === 0 || refresh) {
      await cache();
    }

    return this.cacheProducts;
  }

  /**
   * @see https://developer.paddle.com/api-reference/products/create-product
   */
  async createProduct(options: CreateProductOptions): Promise<Paddle.Product> {
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
      throw new PaddleError('create product failed', request_id, error);
    }

    const product = data ?? {};
    return product;
  }

  /**
   * @see https://developer.paddle.com/api-reference/products/update-product
   */
  async updateProduct(options: UpdateProductOptions): Promise<Paddle.Product> {
    const { productId, status } = options;
    const path = `/products/${productId}`;
    const body = {
      status,
    };

    const response = await this.client.patch<Paddle.Response<Paddle.Product>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      throw new PaddleError('update product failed', request_id, error);
    }

    const product = data ?? {};
    return product;
  }

  /**
   * @see https://developer.paddle.com/api-reference/prices/create-price
   */
  async createPrice(options: CreatePriceOptions): Promise<Paddle.Price> {
    const { billingPlanSourceId, amount, currency, productId, period } = options;
    const amountInCents = amount.toCents().toString();
    const path = '/prices';
    const body = {
      description: `billingPlanSourceId: ${billingPlanSourceId}`,
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
        billingPlanSourceId,
      },
    };

    const response = await this.client.post<Paddle.Response<Paddle.Price>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};

    if (error) {
      throw new PaddleError('create price failed', request_id, error);
    }

    const price = data ?? {};
    return price;
  }

  /**
   * @see https://developer.paddle.com/api-reference/prices/update-price
   */
  async updatePrice(options: UpdatePriceOptions): Promise<Paddle.Price> {
    const { id, status, billingPlanSourceId, currency, amount, period } = options;
    const path = `/prices/${id}`;
    const body = {
      description: `billingPlanSourceId: ${billingPlanSourceId}`,
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
        billingPlanSourceId,
      },
    };

    const response = await this.client.patch<Paddle.Response<Paddle.Price>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};
    if (error) {
      throw new PaddleError('update price failed', request_id, error);
    }

    const price = data ?? {};
    return price;
  }

  /**
   * @see https://developer.paddle.com/api-reference/discounts/list-discounts
   */
  async listDiscounts(options: ListOptions): Promise<ListDiscountsResult> {
    const { after } = options;
    const path = '/discounts';
    const query = {
      after,
      order_by: 'id[ASC]',
      per_page: 50,
    };

    const response = await this.client.get<Paddle.Response<Paddle.Discount[]>>(path, {
      params: query,
    });
    return processPaddleListResponse(response.data, 'list discounts failed');
  }

  async findPrice(options: FindPriceOptions): Promise<Paddle.Price | null> {
    const products = await this.listProductsAllAndCache({ refresh: false });
    const prices = products.flatMap((product) => product.prices ?? []);
    const price = prices.find((price) => matchPrice(options, price));
    return price ?? null;
  }

  async listDiscountsAll(): Promise<Paddle.Discount[]> {
    return await this.listAll({}, async (options) => this.listDiscounts(options));
  }

  /**
   * @see https://developer.paddle.com/api-reference/discounts/create-discount
   */
  async createDiscount(options: CreateDiscountOptions): Promise<Paddle.Discount> {
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
      throw new PaddleError('create discount failed', request_id, error);
    }

    const discount = data ?? {};
    return discount;
  }

  /**
   * @see https://developer.paddle.com/api-reference/discounts/update-discount
   */
  async updateDiscount(options: UpdateDiscountOptions): Promise<Paddle.Discount> {
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
      throw new PaddleError('update discount failed', request_id, error);
    }

    const discount = data ?? {};
    return discount;
  }

  async findDiscount(options: FindDiscountOptions): Promise<Paddle.Discount | null> {
    const discounts = await this.listDiscountsAll();
    const discount = discounts.find((discount) => matchDiscount(options, discount));
    return discount ?? null;
  }

  /**
   * @see https://developer.paddle.com/api-reference/subscriptions/list-subscriptions
   */
  async listSubscriptions(options: ListSubscriptionsOptions): Promise<ListSubscriptionsResult> {
    const { customerId, after } = options;
    const path = '/subscriptions';
    const query = {
      order_by: 'id[ASC]',
      per_page: 50,
      after,
      customer_id: customerId,
    };

    const response = await this.client.get<Paddle.Response<Paddle.Subscription[]>>(path, {
      params: query,
    });
    return processPaddleListResponse(response.data, 'list subscriptions failed');
  }

  async listSubscriptionsAll(options: ListSubscriptionsOptions): Promise<Paddle.Subscription[]> {
    return await this.listAll(options, async (options) => this.listSubscriptions(options));
  }

  async findSubscription(options: FindSubscriptionOptions): Promise<Paddle.Subscription | null> {
    const { customerId, billingPlanInfoId } = options;
    const subscriptions = await this.listSubscriptionsAll({
      customerId,
    });
    const subscription = subscriptions.find((subscription) => subscription.custom_data?.billingPlanInfoId === billingPlanInfoId);
    return subscription ?? null;
  }

  /**
   * @see https://developer.paddle.com/api-reference/subscriptions/get-subscription
   */
  async getSubscription(options: GetSubscriptionOptions): Promise<Paddle.Subscription> {
    const { subscriptionId } = options;
    const path = `/subscriptions/${subscriptionId}`;

    const response = await this.client.get<Paddle.Response<Paddle.Subscription>>(path);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};
    if (error) {
      throw new PaddleError('get subscription failed', request_id, error);
    }

    const subscription = data ?? {};
    return subscription;
  }

  /**
   * @see https://developer.paddle.com/api-reference/subscriptions/update-payment-method
   */
  async getUpdatePaymentMethodTransaction(options: GetUpdatePaymentMethodTransactionOptions): Promise<Paddle.Transaction> {
    const { subscriptionId } = options;
    const path = `/subscriptions/${subscriptionId}/update-payment-method-transaction`;

    const response = await this.client.get<Paddle.Response<Paddle.Transaction>>(path);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};
    if (error) {
      throw new PaddleError('update payment method failed', request_id, error);
    }

    const transaction = data ?? {};
    return transaction;
  }

  /**
   * @see https://developer.paddle.com/api-reference/addresses/list-addresses
   */
  async listAddresses(options: ListAddressesOptions): Promise<ListAddressesResult> {
    const { after, customerId } = options;
    const path = `/customers/${customerId}/addresses`;
    const query = {
      order_by: 'id[ASC]',
      per_page: 50,
      after,
    };

    const response = await this.client.get<Paddle.Response<Paddle.Address[]>>(path, {
      params: query,
    });
    return processPaddleListResponse(response.data, 'list addresses failed');
  }

  async listAddressesAll(options: ListAddressesOptions): Promise<Paddle.Address[]> {
    return await this.listAll(options, async (options) => this.listAddresses(options));
  }

  /**
   * @see https://developer.paddle.com/api-reference/addresses/update-address
   */
  async updateAddress(options: UpdateAddressOptions): Promise<Paddle.Address> {
    const { customerId, addressId, ...body } = options;
    const path = `/customers/${customerId}/addresses/${addressId}`;

    const response = await this.client.patch<Paddle.Response<Paddle.Address>>(path, body);
    const { error, data, meta } = response.data;
    const { request_id } = meta ?? {};
    if (error) {
      throw new PaddleError('update address failed', request_id, error);
    }

    const address = data ?? {};
    return address;
  }
}
