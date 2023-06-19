import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dest } from '../../db/entity/dest.entity';
import { RoutineDeviceJob } from '../../db/entity/device-job.entity';
import { Device } from '../../db/entity/device.entity';
import { RoutineJob } from '../../db/entity/job.entity';
import { RoutinePipeline } from '../../db/entity/pipeline.entity';
import { Project } from '../../db/entity/project.entity';
import { RoutineStep } from '../../db/entity/step.entity';
import { PipelineModule } from '../../module/routine/pipeline/pipeline.module';
import { WsCommonService } from '../common/ws-common.service';
import { LivePipelineStatusGateway } from './live-pipeline-status.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Project, RoutinePipeline, RoutineJob, RoutineDeviceJob, RoutineStep, Dest]), PipelineModule],
  providers: [LivePipelineStatusGateway, WsCommonService],
})
export class LivePipelineStatusModule {}
