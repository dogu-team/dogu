import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pipeline } from 'ioredis';
import { RoutinePipeline } from '../../../db/entity/pipeline.entity';
import { RoutineController } from '../../routine/routine.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pipeline])],
  controllers: [RoutineController],
  providers: [RoutinePipeline],
  exports: [],
})
export class OpenApiV1Moudule {}
