import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pipeline } from 'ioredis';
import { PipelineService } from '../../routine/pipeline/pipeline.service';
import { RoutineV1Controller } from './routine/routin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pipeline])],
  controllers: [RoutineV1Controller],
  providers: [PipelineService],
  exports: [],
})
export class OpenApiV1Moudule {}
