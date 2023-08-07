import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineDeviceJob } from '../../db/entity/device-job.entity';
import { InfluxDbModule } from '../../module/influxdb/influxdb.module';
import { LoggerModule } from '../../module/logger/logger.module';
import { WsCommonModule } from '../common/ws-common.module';
import { LiveProfileGateway } from './live-profile.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([RoutineDeviceJob]), InfluxDbModule, LoggerModule, WsCommonModule],
  providers: [LiveProfileGateway],
})
export class LiveProfileModule {}
