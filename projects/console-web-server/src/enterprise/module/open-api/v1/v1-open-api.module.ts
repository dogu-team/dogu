import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pipeline } from 'ioredis';
import { User } from '../../../../db/entity/user.entity';
import { EventModule } from '../../../../module/event/event.module';
import { ProjectModule } from '../../../../module/project/project.module';
import { PipelineModule } from '../../../../module/routine/pipeline/pipeline.module';
import { WsCommonService } from '../../../../ws/common/ws-common.service';
import { LicenseModule } from '../../license/feature-license.module';
import { V1ProjectController } from './project/project.controller';
import { V1ProjectService } from './project/project.service';
import { V1LivePipelineStatusGateway } from './routine/live-pipeline-state.gateway';
import { V1RoutineController } from './routine/routine.controller';
import { V1RoutineService } from './routine/routine.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pipeline, User]), ProjectModule, PipelineModule, EventModule, LicenseModule],
  controllers: [V1RoutineController, V1ProjectController],
  providers: [WsCommonService, V1RoutineService, V1LivePipelineStatusGateway, V1RoutineService, V1ProjectService],
  exports: [],
})
export class V1OpenApiMoudule {}
