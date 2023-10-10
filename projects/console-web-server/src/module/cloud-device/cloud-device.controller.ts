import { DevicePropCamel, OrganizationPropCamel } from '@dogu-private/console';
import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Device } from '../../db/entity/device.entity';
import { Organization } from '../../db/entity/organization.entity';

@Controller('/cloud-devices')
export class CloudDeviceController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  async getCloudDevice() {
    const devices = await this.dataSource.manager
      .getRepository(Device)
      .createQueryBuilder(Device.name)
      .leftJoinAndSelect(DevicePropCamel.organization, Organization.name)
      .where(`${Organization.name}.${OrganizationPropCamel.shareable} = :shareable`, { shareable: true })
      .getMany();
    console.log(devices);
  }
}
