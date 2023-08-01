import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pipeline } from 'ioredis';
import { User } from '../../../db/entity/user.entity';
import { WsCommonService } from '../../../ws/common/ws-common.service';
import { EventModule } from '../../event/event.module';
import { PipelineModule } from '../../routine/pipeline/pipeline.module';
import { V1LivePipelineStatusGateway } from './routine/live-pipeline-state.gateway';
import { RoutineV1Controller } from './routine/routine.controller';
import { V1RoutineService } from './routine/routine.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pipeline, User]), PipelineModule, EventModule],
  controllers: [RoutineV1Controller],
  providers: [WsCommonService, V1RoutineService, V1LivePipelineStatusGateway, V1RoutineService],
  exports: [],
})
export class OpenApiV1Moudule {}
