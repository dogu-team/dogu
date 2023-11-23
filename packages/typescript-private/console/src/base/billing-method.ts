import { BillingResult } from './billing-code';
import { BillingMethodNiceBase } from './billing-method-nice';

export type UpdateBillingMethodResponse = BillingResult<BillingMethodNiceBase, { niceResultCode: string | null }>;
