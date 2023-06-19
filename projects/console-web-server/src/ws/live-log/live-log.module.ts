import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineDeviceJob } from '../../db/entity/device-job.entity';
import { Device } from '../../db/entity/device.entity';
import { RoutineJob } from '../../db/entity/job.entity';
import { RoutinePipeline } from '../../db/entity/pipeline.entity';
import { Project } from '../../db/entity/project.entity';
import { RoutineStep } from '../../db/entity/step.entity';
import { InfluxDbModule } from '../../module/influxdb/influxdb.module';
import { WsCommonService } from '../common/ws-common.service';
import { LiveLogGateway } from './live-log.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Project, RoutinePipeline, RoutineJob, RoutineDeviceJob, RoutineStep]), InfluxDbModule],
  providers: [LiveLogGateway, WsCommonService],
})
export class LiveLogModule {}
