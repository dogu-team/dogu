import { Module } from '@nestjs/common';
import { BillingMethodNiceService } from './billing-method-nice.service';

@Module({
  providers: [BillingMethodNiceService],
})
export class BillingMethodNiceModule {}
