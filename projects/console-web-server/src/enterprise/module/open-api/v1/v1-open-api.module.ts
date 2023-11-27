import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pipeline } from 'ioredis';

import { User } from '../../../../db/entity/user.entity';
import { EventModule } from '../../../../module/event/event.module';
import { OrganizationModule } from '../../../../module/organization/organization.module';
import { ProjectModule } from '../../../../module/project/project.module';
import { PipelineModule } from '../../../../module/routine/pipeline/pipeline.module';
import { WsCommonService } from '../../../../ws/common/ws-common.service';
import { LicenseModule } from '../../license/license.module';
import { V1OrganizationController } from './organization/organization.controller';
import { V1OrganizationService } from './organization/organization.service';
import { V1LivePipelineStatusGateway } from './routine/live-pipeline-state.gateway';
import { V1RoutineController } from './routine/routine.controller';
import { V1RoutineService } from './routine/routine.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pipeline, User]), ProjectModule, OrganizationModule, PipelineModule, EventModule, LicenseModule],
  controllers: [V1RoutineController, V1OrganizationController],
  providers: [WsCommonService, V1RoutineService, V1LivePipelineStatusGateway, V1RoutineService, V1OrganizationService],
  exports: [],
})
export class V1OpenApiMoudule {}
