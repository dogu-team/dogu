import { IsFilledString, propertiesOf } from '@dogu-tech/common';
import { IsNumber, IsUUID } from 'class-validator';
import { BillingOrganizationBase } from './billing-organization';

export interface BillingMethodNiceBase {
  billingMethodNiceId: string;
  billingOrganizationId: string;
  bid: string | null;
  cardCode: string | null;
  cardName: string | null;
  cardNoLast4: string | null;
  subscribeRegistResponse: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
}

export const BillingMethodNiceProp = propertiesOf<BillingMethodNiceBase>();

export class SubscribeRegistNiceDto {
  @IsFilledString()
  cardNo!: string;

  @IsFilledString()
  expYear!: string;

  @IsFilledString()
  expMonth!: string;

  @IsFilledString()
  idNo!: string;

  @IsFilledString()
  cardPw!: string;
}

/**
 * @example
 * {
 *  resultCode: '0000',
 *  resultMsg: '정상 처리되었습니다.',
 *  tid: 'UT0008879m01162310312052221345',
 *  orderId: '66c5854a-8664-447b-9f51-aea7ea6e9d5f',
 *  bid: 'BIKYUT0008879m2310312052220001',
 *  authDate: '2023-10-31T00:00:00.000+0900',
 *  cardCode: '04',
 *  cardName: '삼성',
 *  messageSource: 'nicepay'
 * }
 * {
 *  resultCode: 'F101',
 *  resultMsg: 'PKCS7 전자서명 및 암호화메시지 검증 실패.',
 *  tid: '',
 *  orderId: '',
 *  bid: null,
 *  authDate: null,
 *  cardCode: null,
 *  cardName: null
 * }
 */
export interface SubscribeRegistNiceResponse {
  resultCode: string;
  resultMsg: string;
  tid: string;
  orderId: string;
  bid: string | null;
  authDate: string | null;
  cardCode: string | null;
  cardName: string | null;
  messageSource?: string;
}

export class CreateOrUpdateBillingMethodNiceDto extends SubscribeRegistNiceDto {
  @IsUUID()
  billingOrganizationId!: string;
}

export class SubscribeExpireNiceDto {
  @IsFilledString()
  bid!: string;
}

/**
 * @example
 * {
 *  resultCode: '0000',
 *  resultMsg: '정상 처리되었습니다.',
 *  tid: 'UT0008879m01162310312116181359',
 *  orderId: '07b1ed92-37df-4a91-929e-b1f5089b06ca',
 *  bid: 'BIKYUT0008879m2310312116180000',
 *  authDate: '2023-10-31T21:16:18.404+0900'
 * }
 * {
 *  resultCode: 'U309',
 *  resultMsg: '발급되지 않은 BID 입니다.',
 *  tid: '',
 *  orderId: '',
 *  bid: '',
 *  authDate: null
 * }
 */
export interface SubscribeExpireNiceResponse {
  resultCode: string;
  resultMsg: string;
  tid: string;
  orderId: string;
  bid: string;
  authDate: string | null;
}

export class SubscribePaymentsNiceDto {
  @IsFilledString()
  bid!: string;

  @IsNumber()
  amount!: number;

  @IsFilledString()
  goodsName!: string;
}

export const NicePaymentStatus = ['', 'paid', 'ready', 'failed', 'cancelled', 'partialCancelled', 'expired'] as const;
export type NicePaymentStatus = (typeof NicePaymentStatus)[number];

export const NiceChannel = ['pc', 'mobile'] as const;
export type NiceChannel = (typeof NiceChannel)[number];

export const NiceCurrency = ['', 'KRW'] as const;
export type NiceCurrency = (typeof NiceCurrency)[number];

/**
 * @example
 * {
 *  resultCode: '0000',
 *  resultMsg: '정상 처리되었습니다.',
 *  tid: 'UT0008879m01162310312154082326',
 *  cancelledTid: null,
 *  orderId: '6d22c237-29dc-461d-8412-a6123cf08412',
 *  ediDate: '2023-10-31T21:54:08.792+0900',
 *  signature: 'aed10d2c0c23aa7ef5cf13eee19173dc7d356b3621c3878f95d3cbc1ef542ef9',
 *  status: 'paid',
 *  paidAt: '2023-10-31T21:54:08.000+0900',
 *  failedAt: '0',
 *  cancelledAt: '0',
 *  payMethod: 'card',
 *  amount: 1000,
 *  balanceAmt: 1000,
 *  goodsName: 'dogu technologies',
 *  mallReserved: null,
 *  useEscrow: false,
 *  currency: 'KRW',
 *  channel: null,
 *  approveNo: '000000',
 *  buyerName: null,
 *  buyerTel: null,
 *  buyerEmail: null,
 *  receiptUrl: 'https://npg.nicepay.co.kr/issue/IssueLoader.do?type=0&innerWin=Y&TID=UT0008879m01162310312154082326',
 *  mallUserId: null,
 *  issuedCashReceipt: false,
 *  coupon: {
 *    couponAmt: 0
 *  },
 *  card: {
 *    cardCode: '04',
 *    cardName: '삼성',
 *    cardNum: '123412******1234',
 *    cardQuota: 0,
 *    isInterestFree: false,
 *    cardType: 'credit',
 *    canPartCancel: true,
 *    acquCardCode: '04',
 *    acquCardName: '삼성'
 *  },
 *  vbank: null,
 *  bank: null,
 *  cellphone: null,
 *  cancels: null,
 *  cashReceipts: null,
 *  bid: 'BIKYUT0008879m2310312154080000',
 *  messageSource: 'nicepay'
 * }
 * {
 *  resultCode: 'U309',
 *  resultMsg: '발급되지 않은 BID 입니다.',
 *  tid: '',
 *  cancelledTid: null,
 *  orderId: '',
 *  ediDate: null,
 *  signature: null,
 *  status: '',
 *  paidAt: '0',
 *  failedAt: '0',
 *  cancelledAt: '0',
 *  payMethod: '',
 *  amount: 0,
 *  balanceAmt: 0,
 *  goodsName: '',
 *  mallReserved: null,
 *  useEscrow: false,
 *  currency: '',
 *  channel: null,
 *  approveNo: null,
 *  buyerName: null,
 *  buyerTel: null,
 *  buyerEmail: null,
 *  receiptUrl: null,
 *  mallUserId: null,
 *  issuedCashReceipt: false,
 *  coupon: null,
 *  card: null,
 *  vbank: null,
 *  bank: null,
 *  cellphone: null,
 *  cancels: null,
 *  cashReceipts: null,
 *  messageSource: null
 * }
 */
export interface SubscribePaymentsNiceResponse {
  resultCode: string;
  resultMsg: string;
  tid: string;
  cancelledTid: string | null;
  orderId: string;
  ediDate: string | null;
  signature: string | null;
  status: NicePaymentStatus;
  paidAt: string;
  failedAt: string;
  cancelledAt: string;
  payMethod: string;
  amount: number;
  balanceAmt: number;
  goodsName: string;
  mallReserved: string | null;
  useEscrow: boolean;
  currency: NiceCurrency;
  channel: NiceChannel | null;
  approveNo: string | null;
  buyerName: string | null;
  buyerTel: string | null;
  buyerEmail: string | null;
  receiptUrl: string | null;
  mallUserId: string | null;
  issuedCashReceipt: boolean;
  coupon: {
    couponAmt: number;
  } | null;
  card: {
    cardCode: string;
    cardName: string;
    cardNum: string;
    cardQuota: number;
    isInterestFree: boolean;
    cardType: string;
    canPartCancel: boolean;
    acquCardCode: string;
    acquCardName: string;
  } | null;
  vbank: null;
  bank: null;
  cellphone: null;
  cancels: null;
  cashReceipts: null;
  bid: string;
  messageSource: string | null;
}
