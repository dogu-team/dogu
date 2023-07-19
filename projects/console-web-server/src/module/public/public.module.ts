import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dest } from '../../db/entity/dest.entity';
import { RoutineStep } from '../../db/entity/step.entity';
import { EventModule } from '../event/event.module';
import { InfluxDbModule } from '../influxdb/influxdb.module';
import { ProjectModule } from '../project/project.module';
import { RemoteModule } from '../remote/remote.module';
import { PipelineModule } from '../routine/pipeline/pipeline.module';
import { PublicActionController } from './public-action-controller';
import { PublicDestController } from './public-dest-controller';
import { PublicDeviceController } from './public-device-controller';
import { PublicRemoteDestController } from './public-retmote-dest-controller';

@Module({
  imports: [TypeOrmModule.forFeature([RoutineStep, Dest]), InfluxDbModule, PipelineModule, EventModule, ProjectModule, RemoteModule],
  controllers: [PublicDeviceController, PublicDestController, PublicActionController, PublicRemoteDestController],
})
export class PublicModule {}
