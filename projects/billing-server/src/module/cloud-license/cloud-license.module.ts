import { Module } from '@nestjs/common';
import { BillingMethodModule } from '../billing-method/billing-method.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { PaddleModule } from '../paddle/paddle.module';
import { CloudLicenseLiveTestingGateway } from './cloud-license-live-testing.gateway';
import { CloudLicenseController } from './cloud-license.controller';
import { CloudLicenseService } from './cloud-license.service';

@Module({
  imports: [BillingTokenModule, DateTimeSimulatorModule, BillingMethodModule, PaddleModule],
  controllers: [CloudLicenseController],
  providers: [CloudLicenseService, CloudLicenseLiveTestingGateway],
})
export class CloudLicenseModule {}
