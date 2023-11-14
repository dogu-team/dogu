import { Module } from '@nestjs/common';
import { BillingMethodModule } from '../billing-method/billing-method.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { BillingUpdaterService } from './billing-updater.service';

@Module({
  imports: [BillingMethodModule, DateTimeSimulatorModule],
  providers: [BillingUpdaterService],
})
export class BillingUpdaterModule {}
