import { Module } from '@nestjs/common';
import { BillingMethodModule } from '../billing-method/billing-method.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { PaddleModule } from '../paddle/paddle.module';
import { CloudLicenseController } from './cloud-license.controller';
import { CloudLicenseEventGateway } from './cloud-license.event.gateway';
import { CloudLicenseService } from './cloud-license.service';
import { CloudLicenseSubscriber } from './cloud-license.subscriber';
import { CloudLicenseUpdateGateway } from './cloud-license.update.gateway';

@Module({
  imports: [BillingTokenModule, DateTimeSimulatorModule, BillingMethodModule, PaddleModule],
  controllers: [CloudLicenseController],
  providers: [CloudLicenseService, CloudLicenseUpdateGateway, CloudLicenseEventGateway, CloudLicenseSubscriber],
})
export class CloudLicenseModule {}
