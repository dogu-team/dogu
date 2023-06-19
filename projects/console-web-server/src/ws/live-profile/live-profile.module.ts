import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineDeviceJob } from '../../db/entity/device-job.entity';
import { InfluxDbModule } from '../../module/influxdb/influxdb.module';
import { LoggerModule } from '../../module/logger/logger.module';
import { WsCommonService } from '../common/ws-common.service';
import { LiveProfileGateway } from './live-profile.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([RoutineDeviceJob]), InfluxDbModule, LoggerModule],
  providers: [LiveProfileGateway, WsCommonService],
})
export class LiveProfileModule {}
