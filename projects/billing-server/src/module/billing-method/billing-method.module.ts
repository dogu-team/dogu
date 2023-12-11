import { forwardRef, Module } from '@nestjs/common';

import { BillingHistoryModule } from '../billing-history/billing-history.module';
import { BillingOrganizationModule } from '../billing-organization/billing-organization.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { NiceModule } from '../nice/nice.module';
import { PaddleModule } from '../paddle/paddle.module';
import { BillingMethodNiceService } from './billing-method-nice.service';
import { BillingMethodPaddleService } from './billing-method-paddle.service';
import { BillingMethodController } from './billing-method.controller';

@Module({
  imports: [BillingTokenModule, forwardRef(() => BillingOrganizationModule), BillingHistoryModule, DateTimeSimulatorModule, NiceModule, PaddleModule],
  providers: [BillingMethodNiceService, BillingMethodPaddleService],
  exports: [BillingMethodNiceService, BillingMethodPaddleService],
  controllers: [BillingMethodController],
})
export class BillingMethodModule {}
