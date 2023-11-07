import { BillingResultCode } from './billing-code';
import { BillingMethodNiceBase } from './billing-method-nice';

export interface UpdateBillingMethodResposneFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface UpdateBillingMethodResponseSuccess {
  ok: true;
  resultCode: BillingResultCode;
  methods: BillingMethodNiceBase[];
}

export type UpdateBillingMethodResponse = UpdateBillingMethodResposneFailure | UpdateBillingMethodResponseSuccess;
