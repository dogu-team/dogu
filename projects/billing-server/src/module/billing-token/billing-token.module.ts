import { Module } from '@nestjs/common';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { BillingTokenService } from './billing-token.service';

@Module({
  imports: [DateTimeSimulatorModule],
  providers: [BillingTokenService],
  exports: [BillingTokenService],
})
export class BillingTokenModule {}
