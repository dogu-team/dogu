import { Injectable } from '@nestjs/common';
import { BillingService } from '../billing.service';

@Injectable()
export class SelfHostedBillingService extends BillingService {
  constructor() {
    super();
  }

  getPaymentMethod(): any {
    return {
      paymentMethod: 'card',
      cardNumber: '1234-1234-1234-1234',
      cardType: 'visa',
      cardExpiration: '12/2024',
    };
  }

  updatePaymentMethod(): any {
    return {
      paymentMethod: 'card',
      cardNumber: '1234-1234-1234-1234',
      cardType: 'visa',
      cardExpiration: '12/2024',
    };
  }

  getBillingHistory(): any {
    return [
      {
        date: '2021-08-01',
        amount: 100,
        description: 'test',
      },
      {
        date: '2021-08-02',
        amount: 200,
        description: 'test2',
      },
    ];
  }
}
