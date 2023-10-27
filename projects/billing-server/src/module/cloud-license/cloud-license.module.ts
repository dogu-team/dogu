import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudLicense } from '../../db/entity/cloud-license.entity';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { CloudLicenseLiveTestingGateway } from './cloud-license-live-testing.gateway';
import { CloudLicenseController } from './cloud-license.controller';
import { CloudLicenseService } from './cloud-license.service';

@Module({
  imports: [TypeOrmModule.forFeature([CloudLicense]), BillingTokenModule],
  controllers: [CloudLicenseController],
  providers: [CloudLicenseService, CloudLicenseLiveTestingGateway],
})
export class CloudLicenseModule {}
