import { Module } from '@nestjs/common';

import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { PaddleModule } from '../paddle/paddle.module';
import { SelfHostedLicenseController } from './self-hosted-license.controller';
import { SelfHostedLicenseService } from './self-hosted-license.service';

@Module({
  imports: [BillingTokenModule, DateTimeSimulatorModule, PaddleModule],
  controllers: [SelfHostedLicenseController],
  providers: [SelfHostedLicenseService],
})
export class SelfHostedLicenseModule {}
