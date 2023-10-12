import { CloudDeviceMetadataBase, DevicePropCamel, DeviceUsageState } from '@dogu-private/console';
import { DeviceConnectionState, DeviceId } from '@dogu-private/types';
import { Injectable, NotFoundException } from '@nestjs/common';
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
    const { keyword } = dto;

    const modelFilterClause = keyword ? `device.${DevicePropCamel.model} ~* :keyword` : '1=1';
    const modelNameFilterClause = keyword ? `device.${DevicePropCamel.modelName} ~* :keyword` : '1=1';
    const manufacturerFilterClause = keyword ? `device.${DevicePropCamel.manufacturer} ~* :keyword` : '1=1';

    const query = this.createCloudDeviceDefaultQuery()
      .andWhere(`device.${DevicePropCamel.model} IN (SELECT DISTINCT device.${DevicePropCamel.model} FROM device)`) // Subquery to select distinct models
      .andWhere(`(${modelFilterClause} OR ${modelNameFilterClause} OR ${manufacturerFilterClause})`, { keyword: `.*${keyword}.*` })
      .orderBy(`device.${DevicePropCamel.modelName}`, 'ASC')
      .addOrderBy(`device.${DevicePropCamel.model}`, 'ASC')
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

  async findCloudDeviceVersionsByModel(model: string): Promise<Device[]> {
    const query = this.createCloudDeviceDefaultQuery().andWhere(`device.model = :model`, { model: model }).select(['device.version', 'device.model']);

    const devices = await query.getMany();
    const usageStates = await Promise.all(devices.map((device) => this.mergeDeviceUsageState({ model: device.model, version: device.version })));

    devices.forEach((device, i) => {
      device.usageState = usageStates[i];
    });

    return devices;
  }

  async findCloudDeviceById(deviceId: DeviceId): Promise<Device> {
    const device = await this.createCloudDeviceDefaultQuery().andWhere(`device.${DevicePropCamel.deviceId} = :deviceId`, { deviceId }).getOne();

    if (!device) {
      throw new NotFoundException(`Device not found. id: ${deviceId}`);
    }

    return device;
  }

  private createCloudDeviceDefaultQuery() {
    return this.dataSource
      .getRepository(Device)
      .createQueryBuilder('device')
      .leftJoin('device.organization', 'organization')
      .where(`device.${DevicePropCamel.isHost} = :isHost`, { isHost: 0 })
      .andWhere(`device.${DevicePropCamel.isGlobal} = :isGlobal`, { isGlobal: 1 })
      .andWhere(`organization.shareable = :shareable`, { shareable: true });
  }

  private async mergeDeviceUsageState(options: { model: string; version?: string }): Promise<DeviceUsageState> {
    const versionFilterClause = options.version ? `device.${DevicePropCamel.version} = :version` : '1=1';
    const query = this.createCloudDeviceDefaultQuery()
      .andWhere(`device.${DevicePropCamel.model} = :model`, { model: options.model })
      .andWhere(versionFilterClause, { version: options.version })
      .select(['device.usageState', 'device.connectionState']);

    const devices = await query.getMany();

    const isOffline = devices.every((device) => device.connectionState !== DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED);
    if (isOffline) {
      return DeviceUsageState.IN_USE;
    }

    const hasAvailableDevice = devices.some((device) => device.usageState === DeviceUsageState.AVAILABLE);
    if (hasAvailableDevice) {
      return DeviceUsageState.AVAILABLE;
    }

    const hasPreparingDevice = devices.some((device) => device.usageState === DeviceUsageState.PREPARING);
    if (hasPreparingDevice) {
      return DeviceUsageState.PREPARING;
    }

    return DeviceUsageState.IN_USE;
  }
}
