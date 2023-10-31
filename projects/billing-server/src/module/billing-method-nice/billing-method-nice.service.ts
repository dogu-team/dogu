import {
  CreateBillingMethodNiceRequest,
  CreateBillingMethodNiceResponse,
  DeleteBillingMethodNiceRequest,
  DeleteBillingMethodNiceResponse,
  PaymentBillingMethodNiceRequest,
  PaymentBillingMethodNiceResponse,
} from '@dogu-private/console';
import { setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { env } from '../../env';
import { FeatureConfig } from '../../feature.config';
import { DoguLogger } from '../logger/logger';

const NiceBaseUrl = FeatureConfig.get('niceSandbox') ? 'https://sandbox-api.nicepay.co.kr/v1' : 'https://api.nicepay.co.kr/v1';
const NiceBasicAuth = Buffer.from(`${env.DOGU_BILLING_NICE_CLIENT_KEY}:${env.DOGU_BILLING_NICE_SECRET_KEY}`).toString('base64');
const NiceAes256Key = Buffer.from(env.DOGU_BILLING_NICE_SECRET_KEY.substring(0, 32));
const NiceAes256Iv = env.DOGU_BILLING_NICE_SECRET_KEY.substring(0, 16);
const NiceCodeManualUrl = 'https://github.com/nicepayments/nicepay-manual/blob/main/common/code.md';

function aes256(data: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', NiceAes256Key, NiceAes256Iv);
  const encrypted = cipher.update(data);
  const encryptedHex = Buffer.concat([encrypted, cipher.final()]).toString('hex');
  return encryptedHex;
}

@Injectable()
export class BillingMethodNiceService {
  private readonly client: AxiosInstance;
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {
    const baseUrl = NiceBaseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${NiceBasicAuth}`,
      },
    });
    setAxiosErrorFilterToIntercepter(this.client);
    this.logger.info(`BillingMethodNiceService initialized with ${baseUrl}`);
  }

  /**
   * @see https://github.com/nicepayments/nicepay-manual/blob/main/api/payment-subscribe.md#%EB%B9%8C%ED%82%A4%EB%B0%9C%EA%B8%89
   */
  async create(dto: CreateBillingMethodNiceRequest): Promise<CreateBillingMethodNiceResponse> {
    const path = '/subscribe/regist';
    const rawString = `cardNo=${dto.cardNo}&expYear=${dto.expYear}&expMonth=${dto.expMonth}&idNo=${dto.idNo}&cardPw=${dto.cardPw}`;
    const encData = aes256(rawString);
    const orderId = v4();
    const body = {
      encData,
      encMode: 'A2',
      orderId,
    };
    this.logger.info('NicePay subscribe/regist request', { path, body });
    const response = await this.client.post<CreateBillingMethodNiceResponse>(path, body);
    const { data } = response;
    this.logger.info('NicePay subscribe/regist response', { data });

    if (orderId !== data.orderId) {
      throw new Error('NicePay subscribe/regist failed: orderId mismatch.');
    }

    if (data.resultCode !== '0000') {
      throw new Error(`NicePay subscribe/regist failed: ${data.resultMsg}. See ${NiceCodeManualUrl}`);
    }

    return data;
  }

  /**
   * @see https://github.com/nicepayments/nicepay-manual/blob/main/api/payment-subscribe.md#%EB%B9%8C%ED%82%A4%EC%82%AD%EC%A0%9C
   */
  async delete(dto: DeleteBillingMethodNiceRequest): Promise<DeleteBillingMethodNiceResponse> {
    const { bid } = dto;
    const path = `/subscribe/${bid}/expire`;
    const orderId = v4();
    const body = {
      orderId,
    };
    this.logger.info('NicePay subscribe/expire request', { path, body });
    const response = await this.client.post<DeleteBillingMethodNiceResponse>(path, body);
    const { data } = response;
    this.logger.info('NicePay subscribe/expire response', { data });

    if (orderId !== data.orderId) {
      throw new Error('NicePay subscribe/expire failed: orderId mismatch.');
    }

    if (data.resultCode !== '0000') {
      throw new Error(`NicePay subscribe/expire failed: ${data.resultMsg}. See ${NiceCodeManualUrl}`);
    }

    return data;
  }

  /**
   * @see https://github.com/nicepayments/nicepay-manual/blob/main/api/payment-subscribe.md#%EB%B9%8C%ED%82%A4%EC%8A%B9%EC%9D%B8
   */
  async payment(dto: PaymentBillingMethodNiceRequest): Promise<PaymentBillingMethodNiceResponse> {
    const { bid, amount } = dto;
    const path = `/subscribe/${bid}/payments`;
    const orderId = v4();
    const body = {
      amount,
      goodsName: 'dogu technologies',
      cardQuota: '0',
      useShopInterest: false,
      orderId,
    };
    this.logger.info('NicePay subscribe/payments request', { path, body });
    const response = await this.client.post<PaymentBillingMethodNiceResponse>(path, body);
    const { data } = response;
    this.logger.info('NicePay subscribe/payments response', { data });

    if (orderId !== data.orderId) {
      throw new Error('NicePay subscribe/payments failed: orderId mismatch.');
    }

    if (data.resultCode !== '0000') {
      throw new Error(`NicePay subscribe/payments failed: ${data.resultMsg}. See ${NiceCodeManualUrl}`);
    }

    if (data.status !== 'paid') {
      throw new Error(`NicePay subscribe/payments failed: ${data.status}. See ${NiceCodeManualUrl}`);
    }

    return data;
  }
}
