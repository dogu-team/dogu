import { DeviceAndDeviceTagPropCamel, DeviceAndDeviceTagPropSnake, DeviceTagBase, DeviceTagPropCamel, DeviceTagPropSnake } from '@dogu-private/console';
import { DeviceId, DeviceTagId, OrganizationId, PlatformType } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { DeviceTag } from '../../../db/entity/device-tag.entity';
import { DeviceAndDeviceTag } from '../../../db/entity/relations/device-and-device-tag.entity';
import { EMPTY_PAGE, Page } from '../../common/dto/pagination/page';
import { DeviceStatusService } from '../device/device-status.service';
import { CreateDeviceTagDto, FindDeviceTagsByOrganizationIdDto, UpdateDeviceTagDto } from './dto/device-tag.dto';

@Injectable()
export class DeviceTagService {
  constructor(
    // @Inject(DeviceStatusService)
    @Inject(forwardRef(() => DeviceStatusService))
    private readonly deviceStatusService: DeviceStatusService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findTagsByOrganizationId(organizationId: OrganizationId, dto: FindDeviceTagsByOrganizationIdDto): Promise<Page<DeviceTagBase>> {
    const disabledHostdevices = await this.deviceStatusService.findDisabledHostDevice(organizationId);
    const disableHostdeviceIds =
      disabledHostdevices.map((device) => device.deviceId).length > 0 ? disabledHostdevices.map((device) => device.deviceId) : ['00000000-0000-0000-0000-000000000000'];
    const rv = await this.dataSource
      .getRepository(DeviceTag) //
      .createQueryBuilder('tag') //
      .leftJoinAndSelect(
        `tag.${DeviceTagPropCamel.deviceAndDeviceTags}`,
        'deviceAndDeviceTags',
        `deviceAndDeviceTags.${DeviceAndDeviceTagPropSnake.device_id} NOT IN (:...disableHostdeviceIds)`,
        { disableHostdeviceIds },
      )
      .leftJoinAndSelect(`deviceAndDeviceTags.${DeviceAndDeviceTagPropCamel.device}`, 'device')
      .where(`tag.${DeviceTagPropSnake.organization_id} = :${DeviceTagPropCamel.organizationId}`, { organizationId })
      .andWhere(`tag.${DeviceTagPropSnake.name} ILIKE :keyword`, { keyword: `%${dto.keyword}%` })
      .orderBy(`tag.${DeviceTagPropCamel.createdAt}`, 'DESC')
      .take(dto.getDBLimit())
      .skip(dto.getDBOffset())
      .getManyAndCount();

    const tags = rv[0];
    if (tags.length === 0) {
      return EMPTY_PAGE;
    }

    tags.map((tag) => {
      tag.devices = tag.deviceAndDeviceTags.map((deviceAndDeviceTag) => deviceAndDeviceTag.device).filter(notEmpty);
    });

    const count = rv[1];

    const page = new Page<DeviceTagBase>(dto.page, dto.offset, count, tags);
    return page;
  }

  async createTag(manager: EntityManager, organizationId: OrganizationId, dto: CreateDeviceTagDto): Promise<DeviceTagBase> {
    const tag = await manager.getRepository(DeviceTag).findOne({ where: { organizationId, name: dto.name }, withDeleted: true });
    if (tag && tag.deletedAt === null) {
      throw new HttpException(`Tag name is duplicated: ${dto.name}`, HttpStatus.CONFLICT);
    }

    if (tag && tag.deletedAt !== null) {
      await manager.getRepository(DeviceTag).recover(tag);
      return tag;
    }

    const newData = manager.getRepository(DeviceTag).create({ organizationId, name: dto.name });
    const rv = await manager.getRepository(DeviceTag).save(newData);

    return rv;
  }

  async updateTag(organizationId: OrganizationId, tagId: DeviceTagId, dto: UpdateDeviceTagDto): Promise<DeviceTagBase> {
    const tag = await this.dataSource.getRepository(DeviceTag).findOne({ where: { organizationId, deviceTagId: tagId } });
    if (!tag) {
      throw new HttpException(`Tag name is not exist: ${dto.name}`, HttpStatus.NOT_FOUND);
    }

    // default tag name check
    if (PlatformType.some((platformType) => platformType === tag.name.toLowerCase())) {
      throw new HttpException(`This tag is not allowed to update. name: ${tag.name}`, HttpStatus.NOT_FOUND);
    }

    // name duplicate check
    const duplicatedTag = await this.dataSource.getRepository(DeviceTag).findOne({ where: { organizationId, name: dto.name } });
    if (duplicatedTag && duplicatedTag.deviceTagId !== tagId) {
      throw new HttpException(`Tag name is duplicated: ${dto.name}`, HttpStatus.CONFLICT);
    }

    // update Tag
    const newData = Object.assign(tag, dto);
    const rv = await this.dataSource.getRepository(DeviceTag).save(newData);

    return rv;
  }

  async findTag(organizationId: OrganizationId, tagId: DeviceTagId): Promise<DeviceTagBase> {
    const rv = await this.dataSource.getRepository(DeviceTag).findOne({ where: { deviceTagId: tagId, organizationId } });
    if (!rv) {
      throw new HttpException(`Tag is not exist: ${tagId}`, HttpStatus.NOT_FOUND);
    }

    return rv;
  }

  async softRemoveTag(organizationId: OrganizationId, deviceTagId: DeviceTagId): Promise<DeviceTagBase> {
    const tagToDelete = await this.dataSource.getRepository(DeviceTag).findOne({ where: { deviceTagId, organizationId } });
    if (!tagToDelete) {
      throw new HttpException(`Tag is not exist: ${deviceTagId}`, HttpStatus.NOT_FOUND);
    }

    if (PlatformType.some((platformType) => platformType === tagToDelete.name)) {
      throw new HttpException(`Tag is not allowed to delete. name: ${tagToDelete.name}`, HttpStatus.NOT_FOUND);
    }

    const rv = await this.dataSource.transaction(async (entityManager) => {
      // delete tag-device
      const tagAndDeviceToDelete = await entityManager.getRepository(DeviceAndDeviceTag).find({ where: { deviceTagId } });
      if (tagAndDeviceToDelete.length > 0) {
        await entityManager.getRepository(DeviceAndDeviceTag).softRemove(tagAndDeviceToDelete);
      }

      // delete tag
      const tag = await entityManager.getRepository(DeviceTag).softRemove(tagToDelete);

      return tag;
    });

    return rv;
  }

  async findTagsByDeviceId(deviceId: DeviceId): Promise<DeviceTagBase[]> {
    const tags = await this.dataSource
      .getRepository(DeviceTag) //
      .createQueryBuilder('tag')
      .innerJoinAndSelect(`tag.${DeviceTagPropCamel.deviceAndDeviceTags}`, 'deviceAndDeviceTags')
      .where(`deviceAndDeviceTags.${DeviceAndDeviceTagPropSnake.device_id} = :${DeviceAndDeviceTagPropCamel.deviceId}`, { deviceId })
      .getMany();

    return tags;
  }
}
