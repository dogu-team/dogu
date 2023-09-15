import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../db/entity/user.entity';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [FeatureService],
  exports: [FeatureService],
  controllers: [FeatureController],
})
export class FeatureModule {}
