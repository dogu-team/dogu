import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from '../../../db/entity/device.entity';
import { Host } from '../../../db/entity/host.entity';
import { DeviceAndDeviceTag } from '../../../db/entity/relations/device-and-device-tag.entity';
import { Token } from '../../../db/entity/token.entity';
import { InfluxDbModule } from '../../influxdb/influxdb.module';
import { DeviceModule } from '../device/device.module';
import { HostController } from './host.controller';
import { HostService } from './host.service';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Host, Token, DeviceAndDeviceTag]), InfluxDbModule, DeviceModule],
  exports: [HostService],
  providers: [HostService],
  controllers: [HostController],
})
export class HostModule {}
