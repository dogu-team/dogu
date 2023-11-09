import { OrganizationId } from '@dogu-private/types';
import { propertiesOf } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { BillingResult, BillingResultWithExtras } from '..';
import { BillingOrganizationBase } from './billing-organization';
import { RegisterCardDto } from './billing-purchase';

export interface BillingMethodNiceBase {
  billingMethodNiceId: string;
  billingOrganizationId: string;
  bid: string | null;
  cardCode: string | null;
  cardName: string | null;
  cardNumberLast4Digits: string | null;
  expirationYear: string | null;
  expirationMonth: string | null;
  subscribeRegistResponse: Record<string, unknown> | null;
  subscribeRegistAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
}

export const BillingMethodNiceProp = propertiesOf<BillingMethodNiceBase>();

export type BillingMethodNicePublic = Pick<BillingMethodNiceBase, 'cardCode' | 'cardName' | 'cardNumberLast4Digits' | 'expirationMonth' | 'expirationYear'>;

export function getBillingMethodNicePublic(billingMethodNice: BillingMethodNiceBase): BillingMethodNicePublic {
  return {
    cardCode: billingMethodNice.cardCode,
    cardName: billingMethodNice.cardName,
    cardNumberLast4Digits: billingMethodNice.cardNumberLast4Digits,
    expirationMonth: billingMethodNice.expirationMonth,
    expirationYear: billingMethodNice.expirationYear,
  };
}

export class NiceSubscribeRegistDto {
  @ValidateNested()
  @Type(() => RegisterCardDto)
  registerCard!: RegisterCardDto;
}

export class CreateOrUpdateMethodNiceDto {
  @IsUUID()
  billingOrganizationId!: string;

  @ValidateNested()
  @Type(() => NiceSubscribeRegistDto)
  subscribeRegist!: NiceSubscribeRegistDto;
}

export class UpdateMethodNiceDto extends NiceSubscribeRegistDto {
  @IsUUID()
  organizationId!: OrganizationId;
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
export interface NiceSubscribeRegistResponse {
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

export type NiceSubscribeRegistResult = BillingResultWithExtras<NiceSubscribeRegistResponse, { niceResultCode: string | null }>;

export interface NiceSubscribeExpireOptions {
  bid: string;
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
export interface NiceSubscribeExpireResponse {
  resultCode: string;
  resultMsg: string;
  tid: string;
  orderId: string;
  bid: string;
  authDate: string | null;
}

export interface NiceSubscribePaymentsOptions {
  bid: string;
  amount: number;
  goodsName: string;
}

export const NiceStatus = ['', 'paid', 'ready', 'failed', 'cancelled', 'partialCancelled', 'expired'] as const;
export type NiceStatus = (typeof NiceStatus)[number];

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
export interface NiceSubscribePaymentsResponse {
  resultCode: string;
  resultMsg: string;
  tid: string;
  cancelledTid: string | null;
  orderId: string;
  ediDate: string | null;
  signature: string | null;
  status: NiceStatus;
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

export type NiceSubscribePaymentsResult = BillingResultWithExtras<NiceSubscribePaymentsResponse, { niceResultCode: string | null }>;

export interface NicePaymentsCancelOptions {
  tid: string;
  reason: string;
  cancelAmt?: number;
}

/**
 * @example
 * {
  "resultCode": "0000",
  "resultMsg": "정상 처리되었습니다.",
  "tid": "UT0009202m01162311081800551655",
  "cancelledTid": "UT0009202m01102311081808157853",
  "orderId": "ed279b2f-3b04-4b6a-b69a-4472f6212d22",
  "ediDate": "2023-11-08T18:08:15.126+0900",
  "signature": "90b37b7d45b3fd9800f1f7cbdd616181b5e15b36fc710869b33915991bd9aaae",
  "status": "partialCancelled",
  "paidAt": "2023-11-08T18:00:55.000+0900",
  "failedAt": "0",
  "cancelledAt": "2023-11-08T18:08:14.000+0900",
  "payMethod": "card",
  "amount": 390,
  "balanceAmt": 290,
  "goodsName": "Dogu Platform Subscription",
  "mallReserved": null,
  "useEscrow": false,
  "currency": "KRW",
  "channel": null,
  "approveNo": "43445090",
  "buyerName": null,
  "buyerTel": null,
  "buyerEmail": null,
  "receiptUrl": "https://npg.nicepay.co.kr/issue/IssueLoader.do?type=0&innerWin=Y&TID=UT0009202m01162311081800551655",
  "mallUserId": null,
  "issuedCashReceipt": false,
  "coupon": {
    "couponAmt": 0
  },
  "card": {
    "cardCode": "01",
    "cardName": "비씨",
    "cardNum": "944192******0764",
    "cardQuota": 0,
    "isInterestFree": false,
    "cardType": "check",
    "canPartCancel": true,
    "acquCardCode": "01",
    "acquCardName": "비씨"
  },
  "vbank": null,
  "bank": null,
  "cellphone": null,
  "cancels": [
    {
      "tid": "UT0009202m01102311081808157853",
      "amount": 100,
      "cancelledAt": "2023-11-08T18:08:14.000+0900",
      "reason": "test",
      "receiptUrl": "https://npg.nicepay.co.kr/issue/IssueLoader.do?type=0&innerWin=Y&TID=UT0009202m01102311081808157853",
      "couponAmt": 0
    }
  ],
  "cashReceipts": null,
  "messageSource": "nicepay"
}
 */

export interface NicePaymentsCancelResponse {
  resultCode: string;
  resultMsg: string;
  tid?: string | null;
  cancelledTid?: string | null;
  orderId?: string | null;
  ediDate?: string | null;
  signature?: string | null;
  status?: NiceStatus | null;
  paidAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
  payMethod?: string | null;
  amount?: number | null;
  balanceAmt?: number | null;
  goodsName?: string | null;
  mallReserved?: string | null;
  useEscrow?: boolean | null;
  currency?: NiceCurrency | null;
  channel?: NiceChannel | null;
  approveNo?: string | null;
  buyerName?: string | null;
  buyerTel?: string | null;
  buyerEmail?: string | null;
  receiptUrl?: string | null;
  mallUserId?: string | null;
  issuedCashReceipt?: boolean | null;
  coupon?: {
    couponAmt?: number | null;
  } | null;
  card?: {
    cardCode?: string | null;
    cardName?: string | null;
    cardNum?: string | null;
    cardQuota?: number | null;
    isInterestFree?: boolean | null;
    cardType?: string | null;
    canPartCancel?: boolean | null;
    acquCardCode?: string | null;
    acquCardName?: string | null;
  } | null;
  vbank?: null;
  bank?: null;
  cellphone?: null;
  cancels?:
    | [
        {
          tid?: string | null;
          amount?: number | null;
          cancelledAt?: string | null;
          reason?: string | null;
          receiptUrl?: string | null;
          couponAmt?: number | null;
        },
      ]
    | null;
  cashReceipts?: null;
  messageSource?: string | null;
}

export interface NicePaymentsOptions {
  tid: string;
}

/**
 * @example
 * {
  "resultCode": "0000",
  "resultMsg": "정상 처리되었습니다.",
  "tid": "UT0009202m01162311081800551655",
  "cancelledTid": null,
  "orderId": "ed279b2f-3b04-4b6a-b69a-4472f6212d22",
  "ediDate": "2023-11-08T18:56:00.194+0900",
  "signature": "3e1a5021fc3988e96c416f5db29ab6fef1c9720e63e63ef757b7887272c69750",
  "status": "partialCancelled",
  "paidAt": "2023-11-08T18:00:55.000+0900",
  "failedAt": "0",
  "cancelledAt": "2023-11-08T18:08:14.000+0900",
  "payMethod": "card",
  "amount": 390,
  "balanceAmt": 290,
  "goodsName": "Dogu Platform Subscription",
  "mallReserved": null,
  "useEscrow": false,
  "currency": "KRW",
  "channel": null,
  "approveNo": "43445090",
  "buyerName": null,
  "buyerTel": null,
  "buyerEmail": null,
  "receiptUrl": "https://npg.nicepay.co.kr/issue/IssueLoader.do?type=0&innerWin=Y&TID=UT0009202m01162311081800551655",
  "mallUserId": null,
  "issuedCashReceipt": false,
  "coupon": {
    "couponAmt": 0
  },
  "card": {
    "cardCode": "01",
    "cardName": "비씨",
    "cardNum": "944192******0764",
    "cardQuota": 0,
    "isInterestFree": false,
    "cardType": "check",
    "canPartCancel": true,
    "acquCardCode": "01",
    "acquCardName": "비씨"
  },
  "vbank": null,
  "bank": null,
  "cellphone": null,
  "cancels": [
    {
      "tid": "UT0009202m01102311081808157853",
      "amount": 100,
      "cancelledAt": "2023-11-08T18:08:14.000+0900",
      "reason": "test",
      "receiptUrl": "https://npg.nicepay.co.kr/issue/IssueLoader.do?type=0&innerWin=Y&TID=UT0009202m01102311081808157853",
      "couponAmt": 0
    }
  ],
  "cashReceipts": null,
  "messageSource": "nicepay"
}
 */

export interface NicePaymentsResponse {
  resultCode: string;
  resultMsg: string;
  tid?: string | null;
  cancelledTid?: string | null;
  orderId?: string | null;
  ediDate?: string | null;
  signature?: string | null;
  status?: NiceStatus | null;
  paidAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
  payMethod?: string | null;
  amount?: number | null;
  balanceAmt?: number | null;
  goodsName?: string | null;
  mallReserved?: string | null;
  useEscrow?: boolean | null;
  currency?: NiceCurrency | null;
  channel?: NiceChannel | null;
  approveNo?: string | null;
  buyerName?: string | null;
  buyerTel?: string | null;
  buyerEmail?: string | null;
  receiptUrl?: string | null;
  mallUserId?: string | null;
  issuedCashReceipt?: boolean | null;
  coupon?: {
    couponAmt?: number | null;
  } | null;
  card?: {
    cardCode?: string | null;
    cardName?: string | null;
    cardNum?: string | null;
    cardQuota?: number | null;
    isInterestFree?: boolean | null;
    cardType?: string | null;
    canPartCancel?: boolean | null;
    acquCardCode?: string | null;
    acquCardName?: string | null;
  } | null;
  vbank?: null;
  bank?: null;
  cellphone?: null;
  cancels?:
    | [
        {
          tid?: string | null;
          amount?: number | null;
          cancelledAt?: string | null;
          reason?: string | null;
          receiptUrl?: string | null;
          couponAmt?: number | null;
        },
      ]
    | null;
  cashReceipts?: null;
  messageSource?: string | null;
}

export interface NicePaymentsNetCancelOptions {
  orderId: string;
}

export interface NicePaymentsNetCancelResponse {
  resultCode: string;
  resultMsg: string;
  tid?: string | null;
  cancelledTid?: string | null;
  orderId?: string | null;
  ediDate?: string | null;
  signature?: string | null;
  status?: NiceStatus | null;
  paidAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
  payMethod?: string | null;
  amount?: number | null;
  balanceAmt?: number | null;
  goodsName?: string | null;
  mallReserved?: string | null;
  useEscrow?: boolean | null;
  currency?: NiceCurrency | null;
  channel?: NiceChannel | null;
  approveNo?: string | null;
  buyerName?: string | null;
  buyerTel?: string | null;
  buyerEmail?: string | null;
  issuedCashReceipt?: boolean | null;
  receiptUrl?: string | null;
  mallUserId?: string | null;
}

export type NiceCallResult<T> = BillingResult<T, { error: Error }>;
