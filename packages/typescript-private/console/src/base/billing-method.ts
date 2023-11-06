import { IsUUID } from 'class-validator';

import { BillingResultCode } from './billing-code';
import { BillingMethodNiceBase } from './billing-method-nice';

export class FindBillingMethodDto {
  @IsUUID()
  organizationId!: string;
}

export interface FindBillingMethodResultFailure {
  ok: false;
  resultCode: BillingResultCode;
}

export interface FindBillingMethodResultSuccess {
  ok: true;
  resultCode: BillingResultCode;
  methods: BillingMethodNiceBase[];
}

export type FindBillingMethodResponse = FindBillingMethodResultFailure | FindBillingMethodResultSuccess;
