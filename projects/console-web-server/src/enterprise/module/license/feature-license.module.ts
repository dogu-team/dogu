import { ClassProvider, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoguLicense } from '../../../db/entity/dogu-license.enitiy';
import { FEATURE_CONFIG } from '../../../feature.config';
import { FeatureLicenseService } from './feature-license.service';
import { LicenseCloudService } from './implementations/license-cloud.service';
import { LicenseSelfHostedService } from './implementations/license-self-hosted.service';
import { LicenseCloudController } from './license-cloud.controller';
import { LicenseSelfHostedController } from './license-self-hosted.controller';

const FeatureLicenseServiceValue = FEATURE_CONFIG.get('licenseModule');
const FeatureLicenseServiceProvider: ClassProvider = {
  provide: FeatureLicenseService,
  useClass: FeatureLicenseServiceValue === 'cloud' ? LicenseCloudService : LicenseSelfHostedService,
};

@Module({
  imports: [TypeOrmModule.forFeature([DoguLicense])],
  controllers: [LicenseCloudController, LicenseSelfHostedController],
  providers: [FeatureLicenseServiceProvider],
  exports: [FeatureLicenseServiceProvider],
})
export class LicenseModule {}
