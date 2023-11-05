import { Module } from '@nestjs/common';
import { BillingSchedulerService } from './billing-scheduler.service';

@Module({
  providers: [BillingSchedulerService],
})
export class BillingSchedulerModule {}
