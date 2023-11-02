import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceConfig } from '../../config';
import { AuthModule } from '../auth/auth.module';
import { BillingCouponModule } from '../billing-coupon/billing-coupon.module';
import { BillingHistoryModule } from '../billing-history/billing-history.module';
import { BillingMethodModule } from '../billing-method/billing-method.module';
import { BillingOrganizationModule } from '../billing-organization/billing-organization.module';
import { BillingPurchaseModule } from '../billing-purchase/billing-purchase.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { CloudLicenseModule } from '../cloud-license/cloud-license.module';
import { LoggerModule } from '../logger/logger.module';
import { SelfHostedLicenseModule } from '../self-hosted-license/self-hosted-license.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceConfig), //
    CloudLicenseModule,
    SelfHostedLicenseModule,
    AuthModule,
    LoggerModule,
    BillingOrganizationModule,
    BillingTokenModule,
    BillingMethodModule,
    BillingHistoryModule,
    BillingCouponModule,
    BillingPurchaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
