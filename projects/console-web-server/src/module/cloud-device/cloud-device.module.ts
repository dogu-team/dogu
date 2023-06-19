import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudDeviceRental } from '../../db/entity/cloud-device-rental.entity';
import { CloudDevice } from '../../db/entity/cloud-device.entity';
import { Device } from '../../db/entity/device.entity';
import { DeviceModule } from '../organization/device/device.module';
import { CloudDeviceController } from './cloud-device.controller';
import { CloudDeviceService } from './cloud-device.service';

@Module({
  imports: [TypeOrmModule.forFeature([Device, CloudDevice, CloudDeviceRental]), DeviceModule],
  controllers: [CloudDeviceController],
  providers: [CloudDeviceService],
  exports: [],
})
export class CloudDeviceModule {}
