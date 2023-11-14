import { ClassProvider, Module } from '@nestjs/common';
import { FeatureConfig } from '../../../feature.config';
import { FeatureFileService } from './feature-file.service';
import { NexusFeatureFileService } from './implementations/nexus-feature-file.service';
import { S3FeatureFileService } from './implementations/s3-feature-file.service';

const FeatureFileServiceValue = FeatureConfig.get('fileService');
const FeatureFileServiceProvider: ClassProvider = {
  provide: FeatureFileService,
  useClass: FeatureFileServiceValue === 's3' ? S3FeatureFileService : NexusFeatureFileService,
};

@Module({
  providers: [FeatureFileServiceProvider],
  exports: [FeatureFileServiceProvider],
})
export class FeatureFileModule {}
