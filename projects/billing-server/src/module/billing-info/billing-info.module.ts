import { Module } from '@nestjs/common';
import { BillingMethodNiceModule } from '../billing-method-nice/billing-method-nice.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { BillingInfoController } from './billing-info.controller';
import { BillingInfoService } from './billing-info.service';

@Module({
  imports: [BillingTokenModule, BillingMethodNiceModule],
  controllers: [BillingInfoController],
  providers: [BillingInfoService],
})
export class BillingInfoModule {}
