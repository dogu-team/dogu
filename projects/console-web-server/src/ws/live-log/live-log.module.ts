import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineDeviceJob } from '../../db/entity/device-job.entity';
import { Device } from '../../db/entity/device.entity';
import { RoutineJob } from '../../db/entity/job.entity';
import { RoutinePipeline } from '../../db/entity/pipeline.entity';
import { Project } from '../../db/entity/project.entity';
import { RoutineStep } from '../../db/entity/step.entity';
import { InfluxDbModule } from '../../module/influxdb/influxdb.module';
import { WsCommonModule } from '../common/ws-common.module';
import { LiveLogGateway } from './live-log.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Project, RoutinePipeline, RoutineJob, RoutineDeviceJob, RoutineStep]), InfluxDbModule, WsCommonModule],
  providers: [LiveLogGateway],
})
export class LiveLogModule {}
