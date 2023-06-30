import { ClassProvider, Module } from '@nestjs/common';
import { FeatureFileService } from './feature-file.service';
import { NexusFeatureFileService } from './implementations/nexus-feature-file.service';

const FeatureFileServiceProvider: ClassProvider = {
  provide: FeatureFileService,
  useClass: NexusFeatureFileService,
};

@Module({
  providers: [FeatureFileServiceProvider],
  exports: [FeatureFileServiceProvider],
})
export class FeatureFileModule {}
