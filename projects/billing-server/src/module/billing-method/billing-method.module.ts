import { forwardRef, Module } from '@nestjs/common';

import { BillingHistoryModule } from '../billing-history/billing-history.module';
import { BillingOrganizationModule } from '../billing-organization/billing-organization.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { BillingMethodNiceCaller } from './billing-method-nice.caller';
import { BillingMethodNiceService } from './billing-method-nice.service';
import { BillingMethodController } from './billing-method.controller';

@Module({
  imports: [BillingTokenModule, forwardRef(() => BillingOrganizationModule), BillingHistoryModule, DateTimeSimulatorModule],
  providers: [BillingMethodNiceCaller, BillingMethodNiceService],
  exports: [BillingMethodNiceService, BillingMethodNiceCaller],
  controllers: [BillingMethodController],
})
export class BillingMethodModule {}
