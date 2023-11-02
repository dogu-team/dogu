import { forwardRef, Module } from '@nestjs/common';
import { BillingMethodModule } from '../billing-method/billing-method.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { BillingOrganizationController } from './billing-organization.controller';
import { BillingOrganizationService } from './billing-organization.service';

@Module({
  imports: [forwardRef(() => BillingMethodModule), BillingTokenModule],
  controllers: [BillingOrganizationController],
  providers: [BillingOrganizationService],
  exports: [BillingOrganizationService],
})
export class BillingOrganizationModule {}
