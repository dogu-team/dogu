import { CloudDeviceMetadataBase, DevicePropCamel, DeviceUsageState } from '@dogu-private/console';
import { DeviceConnectionState } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Device } from '../../db/entity/device.entity';
import { Page } from '../common/dto/pagination/page';
import { FindCloudDevicesDto } from './cloud-device.dto';

@Injectable()
export class CloudDeviceService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findCloudDevices(dto: FindCloudDevicesDto): Promise<Page<CloudDeviceMetadataBase>> {
    const query = this.createCloudDeviceDefaultQuery()
      .andWhere(`device.${DevicePropCamel.model} IN (SELECT DISTINCT device.${DevicePropCamel.model} FROM device)`) // Subquery to select distinct models
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit());

    const [devices, totalCount] = await query.getManyAndCount();
    const usageStates = await Promise.all(devices.map((device) => this.mergeDeviceUsageState({ model: device.model })));

    const metaInfos: CloudDeviceMetadataBase[] = devices.map((device, i) => {
      return {
        model: device.model,
        modelName: device.modelName,
        manufacturer: device.manufacturer,
        resolutionWidth: device.resolutionWidth,
        resolutionHeight: device.resolutionHeight,
        memory: device.memory,
        platform: device.platform,
        location: device.location,
        usageState: usageStates[i],
      };
    });

    return new Page<CloudDeviceMetadataBase>(dto.page, dto.offset, totalCount, metaInfos);
  }

  async findCloudDevicesByModel(model: string): Promise<Device[]> {
    const query = this.createCloudDeviceDefaultQuery().andWhere(`device.model = :model`, { model: model }).select(['device.version', 'device.model']);

    const devices = await query.getMany();
    const usageStates = await Promise.all(devices.map((device) => this.mergeDeviceUsageState({ model: device.model, version: device.version })));

    devices.forEach((device, i) => {
      device.usageState = usageStates[i];
    });

    return devices;
  }

  private createCloudDeviceDefaultQuery() {
    return this.dataSource
      .getRepository(Device)
      .createQueryBuilder('device')
      .leftJoin('device.organization', 'organization')
      .where(`device.${DevicePropCamel.isHost} = :isHost`, { isHost: 0 })
      .andWhere(`device.${DevicePropCamel.isGlobal} = :isGlobal`, { isGlobal: 1 })
      .andWhere(`device.${DevicePropCamel.connectionState} = :connectionState`, { connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED })
      .andWhere(`organization.shareable = :shareable`, { shareable: true });
  }

  private async mergeDeviceUsageState(options: { model: string; version?: string }): Promise<DeviceUsageState> {
    const versionFilterClause = options.version ? `device.${DevicePropCamel.version} = :version` : '1=1';
    const query = this.createCloudDeviceDefaultQuery()
      .andWhere(`device.${DevicePropCamel.model} = :model`, { model: options.model })
      .andWhere(versionFilterClause, { version: options.version })
      .select(['device.usageState']);

    const devices = await query.getMany();

    const hasAvailableDevice = devices.some((device) => device.usageState === DeviceUsageState.available);
    if (hasAvailableDevice) {
      return DeviceUsageState.available;
    }

    const hasPreparingDevice = devices.some((device) => device.usageState === DeviceUsageState.preparing);
    if (hasPreparingDevice) {
      return DeviceUsageState.preparing;
    }

    return DeviceUsageState.busy;
  }
}
