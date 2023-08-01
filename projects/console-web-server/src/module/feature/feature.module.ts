import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';

@Module({
  providers: [FeatureService],
  exports: [FeatureService],
  controllers: [FeatureController],
})
export class FeatureModule {}
