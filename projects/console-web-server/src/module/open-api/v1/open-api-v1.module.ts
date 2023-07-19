import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pipeline } from 'ioredis';
import { User } from '../../../db/entity/user.entity';
import { PipelineModule } from '../../routine/pipeline/pipeline.module';
import { RoutineV1Controller } from './routine/routine.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pipeline, User]), PipelineModule],
  controllers: [RoutineV1Controller],
  providers: [],
  exports: [],
})
export class OpenApiV1Moudule {}
