import { CloudDeviceByModelResponse, CloudDeviceMetadataBase, DevicePropCamel } from '@dogu-private/console';
import { DeviceConnectionState, DeviceId, Platform } from '@dogu-private/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Device } from '../../db/entity/device.entity';
import { retinaDisplayRatio } from '../../resources/retina-display-ratio';
import { Page } from '../common/dto/pagination/page';
import { FindCloudDevicesDto } from './cloud-device.dto';

@Injectable()
export class CloudDeviceService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findCloudDevices(dto: FindCloudDevicesDto): Promise<Page<CloudDeviceMetadataBase>> {
    const { keyword, platform, version } = dto;

    const modelFilterClause = keyword ? `device.${DevicePropCamel.model} ~* :keyword` : '1=1';
    const modelNameFilterClause = keyword ? `device.${DevicePropCamel.modelName} ~* :keyword` : '1=1';
    const manufacturerFilterClause = keyword ? `device.${DevicePropCamel.manufacturer} ~* :keyword` : '1=1';

    const platformFilterClause = platform ? `device.${DevicePropCamel.platform} = :platform` : '1=1';
    const versionFilterClause = version ? `device.${DevicePropCamel.version} LIKE :version` : '1=1';

    // pick representative device for each model
    const cloudDevices = await this.createCloudDeviceDefaultQuery().getMany();

    const deviceMap = new Map<string, Device>();
    cloudDevices.forEach((device) => {
      const key = `${device.model}`;
      const existingDevice = deviceMap.get(key);

      if (!existingDevice) {
        deviceMap.set(key, device);
        return;
      }

      if (device.usageState < existingDevice.usageState) {
        deviceMap.set(key, device);
        return;
      }

      if (device.usageState === existingDevice.usageState) {
        if (device.connectionState === DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED) {
          deviceMap.set(key, device);
          return;
        }
      }
    });
    const representativeDevices = Array.from(deviceMap.values());
    const deviceIds = representativeDevices.map((device) => device.deviceId);

    const query = this.createCloudDeviceDefaultQuery()
      .where('device.device_id IN (:...deviceIds)', { deviceIds })
      .andWhere(`(${modelFilterClause} OR ${modelNameFilterClause} OR ${manufacturerFilterClause})`, { keyword: `.*${keyword}.*` })
      .andWhere(platformFilterClause, { platform })
      .andWhere(versionFilterClause, { version: `${version}%` })
      .orderBy(`device.${DevicePropCamel.modelName}`, 'ASC')
      .addOrderBy(`device.${DevicePropCamel.model}`, 'ASC')
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit());

    const [devices, totalCount] = await query.getManyAndCount();

    devices.forEach((device) => {
      const ratio = retinaDisplayRatio[device.model];

      if (ratio) {
        device.resolutionWidth = device.resolutionWidth * ratio;
        device.resolutionHeight = device.resolutionHeight * ratio;
      }
    });

    const metaInfos: CloudDeviceMetadataBase[] = devices.map((device) => {
      return {
        model: device.model,
        modelName: device.modelName,
        manufacturer: device.manufacturer,
        resolutionWidth: device.resolutionWidth,
        resolutionHeight: device.resolutionHeight,
        memory: device.memory,
        platform: device.platform,
        location: device.location,
        connectionState: device.connectionState,
        usageState: device.usageState,
      };
    });

    return new Page<CloudDeviceMetadataBase>(dto.page, dto.offset, totalCount, metaInfos);
  }

  async findCloudDeviceVersionsByModel(model: string): Promise<CloudDeviceByModelResponse[]> {
    const query = this.createCloudDeviceDefaultQuery()
      .andWhere(`device.model = :model`, { model: model })
      .select([`device.${DevicePropCamel.version}`, `device.${DevicePropCamel.model}`, `device.${DevicePropCamel.usageState}`, `device.${DevicePropCamel.connectionState}`]);
    const devices = await query.getMany();

    // pick representative device for each version
    const deviceMap = new Map<string, Device>();
    devices.forEach((device) => {
      const key = `${device.version}`;
      const existingDevice = deviceMap.get(key);

      if (!existingDevice) {
        deviceMap.set(key, device);
        return;
      }

      if (device.usageState < existingDevice.usageState) {
        deviceMap.set(key, device);
        return;
      }

      if (device.usageState === existingDevice.usageState) {
        if (device.connectionState === DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED) {
          deviceMap.set(key, device);
          return;
        }
      }
    });

    return Array.from(deviceMap.values());
  }

  async findCloudDeviceById(deviceId: DeviceId): Promise<Device> {
    const device = await this.createCloudDeviceDefaultQuery().andWhere(`device.${DevicePropCamel.deviceId} = :deviceId`, { deviceId }).getOne();

    if (!device) {
      throw new NotFoundException(`Device not found. id: ${deviceId}`);
    }

    return device;
  }

  async findCloudDeviceVersions(platform?: Platform): Promise<string[]> {
    const platformFilterClause = platform ? `device.${DevicePropCamel.platform} = :platform` : '1=1';

    const query = this.createCloudDeviceDefaultQuery()
      .andWhere(platformFilterClause, { platform })
      .distinctOn([`device.${DevicePropCamel.version}`])
      .orderBy(`device.${DevicePropCamel.version}`, 'ASC');
    const devices = await query.getMany();

    return devices.map((device) => device.version);
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
}
