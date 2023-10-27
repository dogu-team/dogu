import { Module } from '@nestjs/common';
import { BillingTokenService } from './billing-token.service';

@Module({
  providers: [BillingTokenService],
  exports: [BillingTokenService],
})
export class BillingTokenModule {}
