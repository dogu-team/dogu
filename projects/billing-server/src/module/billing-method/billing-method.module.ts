import { forwardRef, Module } from '@nestjs/common';
import { BillingHistoryModule } from '../billing-history/billing-history.module';

import { BillingOrganizationModule } from '../billing-organization/billing-organization.module';
import { BillingMethodNiceCaller } from './billing-method-nice.caller';
import { BillingMethodNiceService } from './billing-method-nice.service';

@Module({
  imports: [forwardRef(() => BillingOrganizationModule), BillingHistoryModule],
  providers: [BillingMethodNiceCaller, BillingMethodNiceService],
  exports: [BillingMethodNiceService, BillingMethodNiceCaller],
})
export class BillingMethodModule {}
