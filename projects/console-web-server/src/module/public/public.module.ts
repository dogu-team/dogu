import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dest } from '../../db/entity/dest.entity';
import { RoutineStep } from '../../db/entity/step.entity';
import { EventModule } from '../event/event.module';
import { GitlabModule } from '../gitlab/gitlab.module';
import { InfluxDbModule } from '../influxdb/influxdb.module';
import { ProjectModule } from '../project/project.module';
import { PipelineModule } from '../routine/pipeline/pipeline.module';
import { PublicActionController } from './public-action-controller';
import { PublicDestController } from './public-dest-controller';
import { PublicDeviceController } from './public-device-controller';

@Module({
  imports: [TypeOrmModule.forFeature([RoutineStep, Dest]), InfluxDbModule, PipelineModule, EventModule, GitlabModule, ProjectModule],
  controllers: [PublicDeviceController, PublicDestController, PublicActionController],
})
export class PublicModule {}
