import { BillingResultCode } from './billing-code';
import { BillingMethodNiceBase } from './billing-method-nice';

export interface UpdateBillingMethodResposneFailure {
  ok: false;
  resultCode: BillingResultCode;
  niceResultCode: string | null;
}

export interface UpdateBillingMethodResponseSuccess {
  ok: true;
  resultCode: BillingResultCode;
  method: BillingMethodNiceBase;
}

export type UpdateBillingMethodResponse = UpdateBillingMethodResposneFailure | UpdateBillingMethodResponseSuccess;
