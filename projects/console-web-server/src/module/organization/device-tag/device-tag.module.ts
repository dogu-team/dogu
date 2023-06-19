import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device, DeviceAndDeviceTag, DeviceTag } from '../../../db/entity/index';
import { DeviceModule } from '../device/device.module';
import { DeviceTagController } from './device-tag.controller';
import { DeviceTagService } from './device-tag.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceAndDeviceTag, DeviceTag, Device]), //
    forwardRef(() => DeviceModule),
  ],
  controllers: [DeviceTagController],
  providers: [DeviceTagService],
  exports: [DeviceTagService],
})
export class DeviceTagModule {}
