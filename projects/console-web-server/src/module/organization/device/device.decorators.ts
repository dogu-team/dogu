import { DeviceConnectionState, DeviceId } from '@dogu-private/types';
import { ArgumentMetadata, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../../db/entity/device.entity';

@Injectable()
export class IsDeviceExist implements PipeTransform<DeviceId, Promise<DeviceId>> {
  constructor(@InjectRepository(Device) private readonly deviceRepository: Repository<Device>) {}

  async transform(value: DeviceId, metadata: ArgumentMetadata): Promise<DeviceId> {
    const exist = await this.deviceRepository.exist({ where: { deviceId: value } });
    if (!exist) {
      throw new NotFoundException({
        message: 'Device not found',
        deviceId: value,
      });
    }
    return value;
  }
}

@Injectable()
export class IsDeviceConnected implements PipeTransform<DeviceId, Promise<DeviceId>> {
  constructor(@InjectRepository(Device) private readonly deviceRepository: Repository<Device>) {}

  async transform(value: DeviceId, metadata: ArgumentMetadata): Promise<DeviceId> {
    const exist = await this.deviceRepository.exist({ where: { deviceId: value, connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED } });
    if (!exist) {
      throw new NotFoundException({
        message: 'Device not found or not connected',
        deviceId: value,
      });
    }
    return value;
  }
}
