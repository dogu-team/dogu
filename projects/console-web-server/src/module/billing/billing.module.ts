import { Module } from '@nestjs/common';
import { BillingCaller } from './billing.caller';
import { BillingController } from './billing.controller';

@Module({
  controllers: [BillingController],
  providers: [BillingCaller],
})
export class BillingModule {}
