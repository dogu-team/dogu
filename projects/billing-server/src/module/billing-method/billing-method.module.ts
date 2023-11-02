import { Module } from '@nestjs/common';
import { BillingMethodNiceCaller } from './billing-method-nice.caller';
import { BillingMethodNiceService } from './billing-method-nice.service';

@Module({
  providers: [BillingMethodNiceCaller, BillingMethodNiceService],
  exports: [BillingMethodNiceService],
})
export class BillingMethodModule {}
