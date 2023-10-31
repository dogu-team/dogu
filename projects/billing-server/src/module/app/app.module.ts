import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceConfig } from '../../config';
import { AuthModule } from '../auth/auth.module';
import { BillingMethodNiceModule } from '../billing-method-nice/billing-method-nice.module';
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
    BillingTokenModule,
    BillingMethodNiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
