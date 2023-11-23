import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceConfig } from '../../config';
import { AuthModule } from '../auth/auth.module';
import { BillingCouponModule } from '../billing-coupon/billing-coupon.module';
import { BillingHistoryModule } from '../billing-history/billing-history.module';
import { BillingMethodModule } from '../billing-method/billing-method.module';
import { BillingOrganizationModule } from '../billing-organization/billing-organization.module';
import { BillingPurchaseModule } from '../billing-purchase/billing-purchase.module';
import { BillingSubscriptionPlanInfoModule } from '../billing-subscription-plan-info/billing-subscription-plan-info.module';
import { BillingSubscriptionPlanSourceModule } from '../billing-subscription-plan-source/billing-subscription-plan-source.module';
import { BillingTokenModule } from '../billing-token/billing-token.module';
import { BillingUpdaterModule } from '../billing-updater/billing-updater.module';
import { CloudLicenseModule } from '../cloud-license/cloud-license.module';
import { ConsoleModule } from '../console/console.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { LoggerModule } from '../logger/logger.module';
import { NiceModule } from '../nice/nice.module';
import { PaddleModule } from '../paddle/paddle.module';
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
    BillingSubscriptionPlanInfoModule,
    BillingUpdaterModule,
    ConsoleModule,
    DateTimeSimulatorModule,
    PaddleModule,
    NiceModule,
    BillingSubscriptionPlanSourceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
