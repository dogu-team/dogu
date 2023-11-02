import { forwardRef, Module } from '@nestjs/common';

import { BillingOrganizationModule } from '../billing-organization/billing-organization.module';
import { BillingMethodNiceCaller } from './billing-method-nice.caller';
import { BillingMethodNiceService } from './billing-method-nice.service';

@Module({
  imports: [forwardRef(() => BillingOrganizationModule)],
  providers: [BillingMethodNiceCaller, BillingMethodNiceService],
  exports: [BillingMethodNiceService],
})
export class BillingMethodModule {}
