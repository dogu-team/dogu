import { Module } from '@nestjs/common';
import { BillingMethodModule } from '../billing-method/billing-method.module';
import { BillingUpdaterService } from './billing-updater.service';

@Module({
  imports: [BillingMethodModule],
  providers: [BillingUpdaterService],
})
export class BillingUpdaterModule {}
