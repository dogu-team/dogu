import { ClassProvider, Module } from '@nestjs/common';
import { FEATURE_CONFIG } from '../../feature.config';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { CloudBillingService } from './implementations/cloud-billing.service';
import { SelfHostedBillingService } from './implementations/self-hosted-billing.service';

const BillingServiceProvider: ClassProvider = {
  provide: BillingService,
  useClass: FEATURE_CONFIG.get('licenseModule') === 'self-hosted' ? SelfHostedBillingService : CloudBillingService,
};

@Module({
  providers: [BillingServiceProvider],
  exports: [BillingServiceProvider],
  controllers: [BillingController],
})
export class BillingModule {}
