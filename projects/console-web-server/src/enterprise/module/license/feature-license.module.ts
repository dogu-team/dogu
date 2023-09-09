import { ClassProvider, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoguLicense } from '../../../db/entity/dogu-license.enitiy';
import { FEATURE_CONFIG } from '../../../feature.config';
import { FeatureLicenseService } from './feature-license.service';
import { LicenseCloudService } from './implementations/license-cloud.service';
import { LicenseSelfHostedService } from './implementations/license-self-hosted.service';
import { LicenseController } from './license.controller';

const FeatureFileServiceValue = FEATURE_CONFIG.get('licenseVerification');
const FeatureFileServiceProvider: ClassProvider = {
  provide: FeatureLicenseService,
  useClass: FeatureFileServiceValue === 'cloud' ? LicenseCloudService : LicenseSelfHostedService,
};

@Module({
  imports: [TypeOrmModule.forFeature([DoguLicense])],
  controllers: [LicenseController],
  providers: [FeatureFileServiceProvider],
})
export class LicenseModule {}
