import { CloudDeviceMetadataBase, DevicePropCamel } from '@dogu-private/console';
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
    const query = this.dataSource
      .getRepository(Device)
      .createQueryBuilder('device')
      .leftJoin('device.organization', 'organization')
      .where(`device.${DevicePropCamel.isHost} = :isHost`, { isHost: 0 })
      .andWhere(`organization.shareable = :shareable`, { shareable: true })
      .andWhere(`device.model IN (SELECT DISTINCT device.model FROM device)`) // Subquery to select distinct models
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit());

    const [devices, totalCount] = await query.getManyAndCount();

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
        // TODO
        available: true,
      };
    });

    return new Page<CloudDeviceMetadataBase>(dto.page, dto.offset, totalCount, metaInfos);
  }

  async findCloudDevicesByModel(model: string): Promise<Device[]> {
    const query = this.dataSource
      .getRepository(Device)
      .createQueryBuilder('device')
      .leftJoin('device.organization', 'organization')
      .where(`device.${DevicePropCamel.isHost} = :isHost`, { isHost: 0 })
      .andWhere(`organization.shareable = :shareable`, { shareable: true })
      .andWhere(`device.model = :model`, { model: model })
      .select(['device.version']);

    const devices = await query.getMany();

    return devices;
  }
}
