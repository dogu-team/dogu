import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoguLicense } from '../../../db/entity/dogu-license.enitiy';
import { FEATURE_CONFIG } from '../../../feature.config';
// import { FeatureLicenseService } from './feature-license.service';
import { LicenseCloudController } from './license-cloud.controller';
import { LicenseSelfHostedController } from './license-self-hosted.controller';

const FeatureLicenseServiceValue = FEATURE_CONFIG.get('licenseModule');
// const FeatureLicenseServiceProvider: ClassProvider = {
//   provide: FeatureLicenseService,
//   useClass: FeatureLicenseServiceValue === 'cloud' ? LicenseCloudService : LicenseSelfHostedService,
// };

@Module({
  imports: [TypeOrmModule.forFeature([DoguLicense])],
  controllers: [LicenseCloudController, LicenseSelfHostedController],
  // providers: [FeatureLicenseServiceProvider],
  // exports: [FeatureLicenseServiceProvider],
  providers: [],
  exports: [],
})
export class LicenseModule {}

// 클라우드: licese create
// 라이센스 정보 가져오는거... 공통
// self-hosted는 db 테이블 추가
