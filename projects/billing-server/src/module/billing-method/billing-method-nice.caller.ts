import {
  BillingResult,
  NiceCallResult,
  NicePaymentsCancelOptions,
  NicePaymentsCancelResponse,
  NicePaymentsNetCancelOptions,
  NicePaymentsNetCancelResponse,
  NicePaymentsOptions,
  NicePaymentsResponse,
  NiceSubscribeExpireOptions,
  NiceSubscribeExpireResponse,
  NiceSubscribePaymentsOptions,
  NiceSubscribePaymentsResponse,
  NiceSubscribeRegistDto,
  NiceSubscribeRegistResponse,
  resultCode,
} from '@dogu-private/console';
import { errorify, isFilteredAxiosError, setAxiosErrorFilterToIntercepter } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
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
export class BillingMethodNiceCaller {
  private readonly client: AxiosInstance;
  constructor(private readonly logger: DoguLogger) {
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
  async subscribeRegist(dto: NiceSubscribeRegistDto): Promise<BillingResult<NiceSubscribeRegistResponse>> {
    const { cardNumber, expirationYear, expirationMonth, idNumber, cardPasswordFirst2Digits } = dto.registerCard;
    const path = '/subscribe/regist';
    const rawString = `cardNo=${cardNumber}&expYear=${expirationYear}&expMonth=${expirationMonth}&idNo=${idNumber}&cardPw=${cardPasswordFirst2Digits}`;
    const encData = aes256(rawString);
    const orderId = v4();
    const body = {
      encData,
      encMode: 'A2',
      orderId,
    };
    this.logger.info('nice.subscribe/regist request', { path, body });

    const result: NiceCallResult<NiceSubscribeRegistResponse> = await this.client
      .post<NiceSubscribeRegistResponse>(path, body)
      .then((response) => {
        const result: NiceCallResult<NiceSubscribeRegistResponse> = {
          ok: true,
          response: response.data,
        };
        return result;
      })
      .catch((error) => {
        this.logger.error('nice.subscribe/regist failed', { orderId, error: errorify(error) });
        if (isFilteredAxiosError(error)) {
          const result: NiceCallResult<NiceSubscribeRegistResponse> = {
            ok: false,
            resultCode: resultCode('method-nice-subscribe-regist-failed'),
            error,
          };
          return result;
        } else {
          const result: NiceCallResult<NiceSubscribeRegistResponse> = {
            ok: false,
            resultCode: resultCode('unexpected-error'),
            error: errorify(error),
          };
          return result;
        }
      });

    if (!result.ok) {
      this.logger.error('nice.subscribe/regist failed', { orderId, result });
      return {
        ok: false,
        resultCode: result.resultCode,
      };
    }

    const { response } = result;
    this.logger.info('nice.subscribe/regist response', { orderId, response });

    if (orderId !== response.orderId) {
      return {
        ok: false,
        resultCode: resultCode('method-nice-order-id-mismatch', {
          orderId,
          responseOrderId: response.orderId,
        }),
      };
    }

    if (response.resultCode !== '0000') {
      return {
        ok: false,
        resultCode: resultCode('method-nice-subscribe-regist-failed', {
          resultCode: response.resultCode,
          resultMsg: response.resultMsg,
        }),
      };
    }

    if (!response.bid) {
      return {
        ok: false,
        resultCode: resultCode('method-nice-bid-not-found'),
      };
    }

    return {
      ok: true,
      value: response,
    };
  }

  /**
   * @see https://github.com/nicepayments/nicepay-manual/blob/main/api/payment-subscribe.md#%EB%B9%8C%ED%82%A4%EC%82%AD%EC%A0%9C
   */
  async subscribeExpire(dto: NiceSubscribeExpireOptions): Promise<BillingResult<NiceSubscribeExpireResponse>> {
    const { bid } = dto;
    const path = `/subscribe/${bid}/expire`;
    const orderId = v4();
    const body = {
      orderId,
    };
    this.logger.info('nice.subscribe/expire request', { path, body });

    const result: NiceCallResult<NiceSubscribeExpireResponse> = await this.client
      .post<NiceSubscribeExpireResponse>(path, body)
      .then((response) => {
        const result: NiceCallResult<NiceSubscribeExpireResponse> = {
          ok: true,
          response: response.data,
        };
        return result;
      })
      .catch((error) => {
        this.logger.error('nice.subscribe/expire failed', { orderId, error: errorify(error) });
        if (isFilteredAxiosError(error)) {
          const result: NiceCallResult<NiceSubscribeExpireResponse> = {
            ok: false,
            resultCode: resultCode('method-nice-subscribe-expire-failed'),
            error,
          };
          return result;
        } else {
          const result: NiceCallResult<NiceSubscribeExpireResponse> = {
            ok: false,
            resultCode: resultCode('unexpected-error'),
            error: errorify(error),
          };
          return result;
        }
      });

    if (!result.ok) {
      this.logger.error('nice.subscribe/expire failed', { orderId, result });
      return {
        ok: false,
        resultCode: result.resultCode,
      };
    }

    const { response } = result;
    this.logger.info('nice.subscribe/expire response', { orderId, response });

    if (orderId !== response.orderId) {
      return {
        ok: false,
        resultCode: resultCode('method-nice-order-id-mismatch', {
          orderId,
          dataOrderId: response.orderId,
        }),
      };
    }

    if (response.resultCode !== '0000') {
      return {
        ok: false,
        resultCode: resultCode('method-nice-subscribe-expire-failed', {
          resultCode: response.resultCode,
          resultMsg: response.resultMsg,
        }),
      };
    }

    return {
      ok: true,
      value: response,
    };
  }

  /**
   * @see https://github.com/nicepayments/nicepay-manual/blob/main/api/payment-subscribe.md#%EB%B9%8C%ED%82%A4%EC%8A%B9%EC%9D%B8
   */
  async subscribePayments(dto: NiceSubscribePaymentsOptions): Promise<BillingResult<NiceSubscribePaymentsResponse>> {
    const { bid, amount, goodsName } = dto;
    const path = `/subscribe/${bid}/payments`;
    const orderId = v4();
    const body = {
      amount,
      goodsName,
      cardQuota: '0',
      useShopInterest: false,
      orderId,
    };
    this.logger.info('nice.subscribe/payments request', { path, body });

    const result: NiceCallResult<NiceSubscribePaymentsResponse> = await this.client
      .post<NiceSubscribePaymentsResponse>(path, body)
      .then((response) => {
        const result: NiceCallResult<NiceSubscribePaymentsResponse> = {
          ok: true,
          response: response.data,
        };
        return result;
      })
      .catch((error) => {
        this.logger.error('nice.subscribe/payments failed', { orderId, error: errorify(error) });
        if (isFilteredAxiosError(error)) {
          if (error.responseStatus === undefined) {
            const result: NiceCallResult<NiceSubscribePaymentsResponse> = {
              ok: false,
              resultCode: resultCode('method-nice-network-error'),
              error,
            };
            return result;
          } else {
            const result: NiceCallResult<NiceSubscribePaymentsResponse> = {
              ok: false,
              resultCode: resultCode('method-nice-subscribe-payments-failed'),
              error,
            };
            return result;
          }
        } else {
          const result: NiceCallResult<NiceSubscribePaymentsResponse> = {
            ok: false,
            resultCode: resultCode('unexpected-error'),
            error: errorify(error),
          };
          return result;
        }
      });

    if (!result.ok) {
      this.logger.error('nice.subscribe/payments failed', { orderId, result });
      if (result.resultCode.reason === 'method-nice-network-error') {
        try {
          const result = await this.paymentsNetCancel({ orderId });
          this.logger.info('nice.subscribe/payments/netcancel success', { orderId, result });
        } catch (error) {
          this.logger.error('nice.subscribe/payments/netcancel failed', { orderId, error: errorify(error) });
        }
      }

      return {
        ok: false,
        resultCode: result.resultCode,
      };
    }

    const { response } = result;
    this.logger.info('nice.subscribe/payments response', { orderId, response });

    if (orderId !== response.orderId) {
      return {
        ok: false,
        resultCode: resultCode('method-nice-order-id-mismatch', {
          orderId,
          responseOrderId: response.orderId,
        }),
      };
    }

    if (response.resultCode !== '0000') {
      return {
        ok: false,
        resultCode: resultCode('method-nice-subscribe-expire-failed', {
          resultCode: response.resultCode,
          resultMsg: response.resultMsg,
        }),
      };
    }

    if (response.status !== 'paid') {
      return {
        ok: false,
        resultCode: resultCode('method-nice-status-not-paid', {
          status: response.status,
        }),
      };
    }

    return {
      ok: true,
      value: response,
    };
  }

  /**
   * @see https://github.com/nicepayments/nicepay-manual/blob/main/api/cancel.md#%EC%B7%A8%EC%86%8C%ED%99%98%EB%B6%88
   */
  async paymentsCancel(options: NicePaymentsCancelOptions): Promise<BillingResult<NicePaymentsCancelResponse>> {
    const { tid, reason, cancelAmt } = options;
    const path = `/payments/${tid}/cancel`;
    const orderId = v4();
    const body = {
      cancelAmt,
      reason,
      orderId,
    };
    this.logger.info('NicePay payments/cancel request', { path, body });

    const result: NiceCallResult<NicePaymentsCancelResponse> = await this.client
      .post<NicePaymentsCancelResponse>(path, body)
      .then((response) => {
        const result: NiceCallResult<NicePaymentsCancelResponse> = {
          ok: true,
          response: response.data,
        };
        return result;
      })
      .catch((error) => {
        this.logger.error('nice.payments/cancel failed', { orderId, error: errorify(error) });
        if (isFilteredAxiosError(error)) {
          const result: NiceCallResult<NiceSubscribePaymentsResponse> = {
            ok: false,
            resultCode: resultCode('method-nice-payments-cancel-failed'),
            error,
          };
          return result;
        } else {
          const result: NiceCallResult<NicePaymentsCancelResponse> = {
            ok: false,
            resultCode: resultCode('unexpected-error'),
            error: errorify(error),
          };
          return result;
        }
      });

    if (!result.ok) {
      this.logger.error('nice.payments/cancel failed', { orderId, result });
      return {
        ok: false,
        resultCode: result.resultCode,
      };
    }

    const { response } = result;
    this.logger.info('nice.payments/cancel response', { orderId, response });

    if (response.resultCode !== '0000') {
      return {
        ok: false,
        resultCode: resultCode('method-nice-payments-cancel-failed', {
          resultCode: response.resultCode,
          resultMsg: response.resultMsg,
        }),
      };
    }

    if (response.status !== null && !(response.status === 'cancelled' || response.status === 'partialCancelled')) {
      return {
        ok: false,
        resultCode: resultCode('method-nice-status-not-canceled-or-partial-cancelled', {
          status: response.status,
        }),
      };
    }

    return {
      ok: true,
      value: response,
    };
  }

  /**
   * @see https://github.com/nicepayments/nicepay-manual/blob/main/api/status-transaction.md#%EA%B1%B0%EB%9E%98-%EC%A1%B0%ED%9A%8C
   */
  async payments(dto: NicePaymentsOptions): Promise<BillingResult<NicePaymentsCancelResponse>> {
    const { tid } = dto;
    const path = `/payments/${tid}`;
    this.logger.info('NicePay payments request', { path });

    const result: NiceCallResult<NicePaymentsCancelResponse> = await this.client
      .get<NicePaymentsResponse>(path)
      .then((response) => {
        const result: NiceCallResult<NicePaymentsCancelResponse> = {
          ok: true,
          response: response.data,
        };
        return result;
      })
      .catch((error) => {
        this.logger.error('nice.payments failed', { error: errorify(error) });
        if (isFilteredAxiosError(error)) {
          const result: NiceCallResult<NiceSubscribePaymentsResponse> = {
            ok: false,
            resultCode: resultCode('method-nice-payments-failed'),
            error,
          };
          return result;
        } else {
          const result: NiceCallResult<NicePaymentsCancelResponse> = {
            ok: false,
            resultCode: resultCode('unexpected-error'),
            error: errorify(error),
          };
          return result;
        }
      });

    if (!result.ok) {
      this.logger.error('nice.payments failed', { result });
      return {
        ok: false,
        resultCode: result.resultCode,
      };
    }

    const { response } = result;
    this.logger.info('nice.payments response', { response });

    if (response.resultCode !== '0000') {
      return {
        ok: false,
        resultCode: resultCode('method-nice-payments-failed', {
          resultCode: response.resultCode,
          resultMsg: response.resultMsg,
        }),
      };
    }

    return {
      ok: true,
      value: response,
    };
  }

  /**
   * @see https://github.com/nicepayments/nicepay-manual/blob/main/api/cancel.md#%EB%A7%9D%EC%B7%A8%EC%86%8C
   */
  private async paymentsNetCancel(dto: NicePaymentsNetCancelOptions): Promise<BillingResult<NicePaymentsNetCancelResponse>> {
    const { orderId } = dto;
    const path = `/payments/netcancel`;
    const body = {
      orderId,
    };
    this.logger.info('nice.payments/netcancel request', { path, body });

    const result: NiceCallResult<NicePaymentsNetCancelResponse> = await this.client
      .post<NicePaymentsNetCancelResponse>(path, body)
      .then((response) => {
        const result: NiceCallResult<NicePaymentsNetCancelResponse> = {
          ok: true,
          response: response.data,
        };
        return result;
      })
      .catch((error) => {
        this.logger.error('nice.payments/netcancel failed', { error: errorify(error) });
        if (isFilteredAxiosError(error)) {
          const result: NiceCallResult<NicePaymentsNetCancelResponse> = {
            ok: false,
            resultCode: resultCode('method-nice-payments-netcancel-failed'),
            error,
          };
          return result;
        } else {
          const result: NiceCallResult<NicePaymentsNetCancelResponse> = {
            ok: false,
            resultCode: resultCode('unexpected-error'),
            error: errorify(error),
          };
          return result;
        }
      });

    if (!result.ok) {
      this.logger.error('nice.payments/netcancel failed', { result });
      return {
        ok: false,
        resultCode: result.resultCode,
      };
    }

    const { response } = result;
    this.logger.info('nice.payments/netcancel response', { orderId, response });

    if (response.resultCode !== '0000') {
      return {
        ok: false,
        resultCode: resultCode('method-nice-payments-netcancel-failed', {
          resultCode: response.resultCode,
          resultMsg: response.resultMsg,
        }),
      };
    }

    return {
      ok: true,
      value: response,
    };
  }
}
