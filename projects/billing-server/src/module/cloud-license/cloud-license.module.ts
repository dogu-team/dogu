import { Module } from '@nestjs/common';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { CloudLicenseLiveTestingGateway } from './cloud-license-live-testing.gateway';
import { CloudLicenseController } from './cloud-license.controller';
import { CloudLicenseService } from './cloud-license.service';

@Module({
  imports: [BillingTokenModule, DateTimeSimulatorModule],
  controllers: [CloudLicenseController],
  providers: [CloudLicenseService, CloudLicenseLiveTestingGateway],
})
export class CloudLicenseModule {}
