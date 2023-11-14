import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BillingService {
  constructor() {}

  abstract getPaymentMethod(): any;
  abstract updatePaymentMethod(): any;
  abstract getBillingHistory(): any;
}
