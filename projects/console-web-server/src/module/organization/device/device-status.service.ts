import {
  DeviceAndDeviceTagPropCamel,
  DeviceAndDeviceTagPropSnake,
  DeviceBase,
  DevicePropCamel,
  DevicePropSnake,
  DeviceResponse,
  DeviceTagPropCamel,
  ProjectAndDevicePropCamel,
  ProjectAndDevicePropSnake,
  ProjectBase,
} from '@dogu-private/console';
import {
  DeviceConnectionState,
  DeviceId,
  DeviceTagId,
  OrganizationId,
  PIPELINE_STATUS,
  Platform,
  platformFromPlatformType,
  PlatformType,
  platformTypeFromPlatform,
  ProjectId,
  REMOTE_DEVICE_JOB_STATE,
  Serial,
  UserPayload,
  validateMaxParallelJobs,
} from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { ForbiddenException, forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseEntity, Brackets, DataSource, EntityManager, In, SelectQueryBuilder } from 'typeorm';
import { Device } from '../../../db/entity/device.entity';
import { DeviceTag, Project } from '../../../db/entity/index';
import { DeviceAndDeviceTag } from '../../../db/entity/relations/device-and-device-tag.entity';
import { ProjectAndDevice } from '../../../db/entity/relations/project-and-device.entity';
import { Page } from '../../common/dto/pagination/page';
import { DeviceTagService } from '../device-tag/device-tag.service';
import { AttachTagToDeviceDto, EnableDeviceDto, FindAddableDevicesByOrganizationIdDto, FindDevicesByOrganizationIdDto, UpdateDeviceDto } from './dto/device.dto';

@Injectable()
export class DeviceStatusService {
  constructor(
    // @Inject(DeviceTagService)
    @Inject(forwardRef(() => DeviceTagService))
    private readonly tagService: DeviceTagService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findDevicesByOrganizationId(userPayload: UserPayload, organizationId: OrganizationId, dto: FindDevicesByOrganizationIdDto): Promise<Page<DeviceResponse>> {
    const projectIdFilterClause = dto.projectIds.length !== 0 ? 'project.project_id IN (:...projectIds)' : '1=1';
    const connectionStateFilterClause = dto.connectionStates.length !== 0 ? 'device.connection_state IN (:...connectionStates)' : '1=1';
    const tagNameFilterCluase = dto.tagNames.length !== 0 ? 'deviceTag.name IN (:...tagNames)' : '1=1';
    const hostIdFilterClause = !!dto.hostId ? 'host.host_id = :hostId' : '1=1';

    const isGlobalFilter =
      dto.projectIds.length === 0 //
        ? `(device.is_global = 1
        AND device.organization_id = '${organizationId}'
        AND device.name LIKE '%${dto.deviceName}%'
        AND ${connectionStateFilterClause}
        AND ${tagNameFilterCluase})`
        : '1=0';

    const rv = await this.dataSource //
      .getRepository(Device)
      .createQueryBuilder('device')
      .innerJoin('device.organization', 'organization')
      .leftJoinAndSelect(`device.${DevicePropCamel.deviceAndDeviceTags}`, 'deviceAndDeviceTag')
      .leftJoinAndSelect(`deviceAndDeviceTag.${DeviceAndDeviceTagPropCamel.deviceTag}`, 'deviceTag')
      .leftJoinAndSelect('device.host', 'host')
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
      .leftJoinAndSelect(`projectAndDevice.${ProjectAndDevicePropCamel.project}`, 'project')
      .leftJoinAndSelect(`device.${DevicePropCamel.routineDeviceJobs}`, 'deviceJob', `deviceJob.status IN (:...status)`, {
        status: [PIPELINE_STATUS.WAITING, PIPELINE_STATUS.IN_PROGRESS, PIPELINE_STATUS.CANCEL_REQUESTED],
      })
      .leftJoinAndSelect(`device.${DevicePropCamel.remoteDeviceJobs}`, 'remoteDeviceJob', `remoteDeviceJob.state IN (:...state)`, {
        state: [REMOTE_DEVICE_JOB_STATE.WAITING, REMOTE_DEVICE_JOB_STATE.IN_PROGRESS],
      })
      .where('organization.organization_id = :organizationId', { organizationId })
      .andWhere('device.name LIKE :name', { name: `%${dto.deviceName}%` })
      .andWhere(projectIdFilterClause, { projectIds: dto.projectIds })
      .andWhere(hostIdFilterClause, { hostId: dto.hostId })
      .andWhere('project.project_id IS NOT NULL')
      .andWhere(connectionStateFilterClause, { connectionStates: dto.connectionStates })
      .andWhere(tagNameFilterCluase, { tagNames: dto.tagNames })
      .orWhere(isGlobalFilter)
      .orderBy('device.updated_at', 'DESC')
      .getManyAndCount();
    const devices = rv[0];
    const totalCount = rv[1];

    // many to many relation
    for (const device of devices) {
      const tagAndDevices = device.deviceAndDeviceTags ? device.deviceAndDeviceTags : [];
      device.deviceTags = tagAndDevices.map((tagAndDevice) => tagAndDevice.deviceTag).filter(notEmpty);

      const deviceAndProjects = device.projectAndDevices ? device.projectAndDevices : [];
      device.projects = deviceAndProjects.map((deviceAndProject) => deviceAndProject.project).filter(notEmpty);
    }

    const deviceLimited = devices.slice(dto.getDBOffset(), dto.getDBOffset() + dto.getDBLimit());

    const page = new Page<DeviceResponse>(dto.page, dto.offset, totalCount, deviceLimited);
    return page;
  }

  async findAddableDevicesByOrganizationId(userPayload: UserPayload, organizationId: OrganizationId, dto: FindAddableDevicesByOrganizationIdDto): Promise<Page<DeviceBase>> {
    const qb = this.dataSource.getRepository(Device).createQueryBuilder('device');
    const hostIdFilterClause = !!dto.hostId ? 'host.host_id = :hostId' : '1=1';

    const projectDeviceSubQuery = qb.subQuery().select('dp.device_id').from(ProjectAndDevice, 'dp');
    const hostDeviceSubQuery = qb
      .subQuery() //
      .select(`hostDevice.${DevicePropSnake.device_id}`)
      .from(Device, 'hostDevice')
      .where(`hostDevice.${DevicePropSnake.is_host} = 1 AND hostDevice.${DevicePropSnake.enable_host_device} = 0`);

    const rawPagedDevicesQuery = qb
      .where('device.organization_id = :organizationId', { organizationId })
      .andWhere(`device.${DevicePropSnake.device_id} NOT IN ${projectDeviceSubQuery.getQuery()}`)
      .andWhere(`device.${DevicePropSnake.device_id} NOT IN ${hostDeviceSubQuery.getQuery()}`)
      .andWhere(`device.${DevicePropSnake.is_global} = 0`)
      .andWhere(`device.${DevicePropSnake.name} LIKE :name`, { name: `%${dto.deviceName}%` })
      .innerJoinAndSelect(`device.${DevicePropCamel.host}`, 'host')
      .andWhere(hostIdFilterClause, { hostId: dto.hostId })
      .orderBy(`device.${DevicePropCamel.updatedAt}`, 'DESC')
      .limit(dto.getDBLimit())
      .offset(dto.getDBOffset());

    const [paginationResult, totalCount] = await rawPagedDevicesQuery.getManyAndCount();

    const page = new Page<DeviceBase>(dto.page, dto.offset, totalCount, paginationResult);
    return page;
  }

  async findDevice(deviceId: DeviceId): Promise<DeviceResponse> {
    const device = await this.dataSource
      .getRepository(Device) //
      .createQueryBuilder('device')
      .leftJoinAndSelect(`device.${DevicePropCamel.deviceAndDeviceTags}`, 'deviceAndDeviceTag')
      .leftJoinAndSelect(`deviceAndDeviceTag.${DeviceAndDeviceTagPropCamel.deviceTag}`, 'deviceTag')
      .leftJoinAndSelect(`device.${DevicePropCamel.host}`, 'host')
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
      .leftJoinAndSelect(`projectAndDevice.${ProjectAndDevicePropCamel.project}`, 'project')
      .where(`device.${DevicePropCamel.deviceId} = :deviceId`, { deviceId })
      .orderBy(`device.${DevicePropCamel.updatedAt}`, 'DESC')
      .orderBy(`deviceTag.${DeviceTagPropCamel.createdAt}`, 'ASC')
      .getOne();

    if (!device) {
      throw new HttpException(`Cannot find device. deviceId: ${deviceId}`, HttpStatus.NOT_FOUND);
    }

    // many to many relation
    const tagAndDevices = device.deviceAndDeviceTags ? device.deviceAndDeviceTags : [];
    device.deviceTags = tagAndDevices.map((tagAndDevice) => tagAndDevice.deviceTag).filter(notEmpty);

    const deviceAndProjects = device.projectAndDevices ? device.projectAndDevices : [];
    device.projects = deviceAndProjects.map((deviceAndProject) => deviceAndProject.project).filter(notEmpty);

    return device;
  }

  async findSerialByDeviceId(deviceId: DeviceId): Promise<Serial> {
    const device = await this.dataSource.getRepository(Device).findOne({ where: { deviceId } });
    if (device === null) {
      throw new NotFoundException({
        message: 'Cannot find device',
        deviceId,
      });
    }
    const { serial } = device;
    return serial;
  }

  async disableDevice(organizationId: OrganizationId, deviceId: DeviceId): Promise<void> {
    const device = await this.findDeviceWithRelations(deviceId, false);

    if (!device) {
      throw new NotFoundException(`Cannot find device. deviceId: ${deviceId}`);
    }

    await this.dataSource.transaction(async (manager) => {
      // public device
      if (device.isGlobal === 1) {
        await this.dataSource.getRepository(Device).save(Object.assign(device, { isGlobal: 0 }));
        // return;
      }

      //  belongs to project device
      const deviceAndProjects = device.projectAndDevices ? device.projectAndDevices : [];
      if (deviceAndProjects.length > 0) {
        await manager.getRepository(ProjectAndDevice).softRemove(deviceAndProjects);
      }
    });

    return;
  }

  async addDefaultTagToDevices(manager: EntityManager, device: Device): Promise<void> {
    const { deviceId, organizationId, platform } = device;
    const defaultPlatformTagName = platformTypeFromPlatform(platform);

    const tag = await manager.getRepository(DeviceTag).findOne({ where: { organizationId, name: defaultPlatformTagName } });
    if (!tag) {
      const newTag = await this.tagService.createTag(manager, organizationId, { name: defaultPlatformTagName });
      await this.addTagToDevice(manager, deviceId, { tagId: newTag.deviceTagId });
      return;
    } else {
      const tagAndDevice = await manager.getRepository(DeviceAndDeviceTag).findOne({ where: { deviceTagId: tag.deviceTagId, deviceId } });
      if (!tagAndDevice) {
        await this.addTagToDevice(manager, deviceId, { tagId: tag.deviceTagId });
      }
    }
    return;
  }
  async enableAndUpateDevice(organizationId: OrganizationId, deviceId: DeviceId, dto: EnableDeviceDto): Promise<void> {
    const { projectId } = dto;
    const device = await this.dataSource.getRepository(Device).findOne({ where: { deviceId } });
    if (!device) {
      throw new HttpException(`Cannot find device. deviceId: ${deviceId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      if (dto.isGlobal === true) {
        const deviceAndProjects = await manager.getRepository(ProjectAndDevice).find({ where: { deviceId } });
        if (deviceAndProjects.length > 0) {
          await manager.getRepository(ProjectAndDevice).softRemove(deviceAndProjects);
        }
        await manager.getRepository(Device).save(Object.assign(device, { isGlobal: 1 }));
      } else if (dto.projectId) {
        const deviceAndProject = await manager.getRepository(ProjectAndDevice).findOne({ where: { deviceId, projectId }, withDeleted: true });
        if (deviceAndProject) {
          if (deviceAndProject.deletedAt) {
            await manager.getRepository(ProjectAndDevice).recover(deviceAndProject);
          }
          await manager.getRepository(Device).save(Object.assign(device, { isGlobal: 0 }));
        } else {
          const newData = manager.getRepository(ProjectAndDevice).create({ deviceId, projectId });
          await manager.getRepository(ProjectAndDevice).save(newData);
          await manager.getRepository(Device).save(Object.assign(device, { isGlobal: 0 }));
        }
      } else {
        await manager.getRepository(Device).save(Object.assign(device, { isGlobal: 0 }));
      }
      await this.addDefaultTagToDevices(manager, device);
    });
    return;
  }

  async findAllocatedProjects(deviceId: DeviceId): Promise<ProjectBase[]> {
    const qb = this.dataSource.getRepository(Project).createQueryBuilder('project');
    const subQuery = qb.subQuery().select('dp.project_id').from(ProjectAndDevice, 'dp').where('dp.device_id = :deviceId', { deviceId });
    const rawPagedProjectsQuery = qb.where(`project.project_id IN ${subQuery.getQuery()}`);
    const projects = await rawPagedProjectsQuery.getMany();

    return projects;
  }

  async softRemoveDeviceFromProject(organizationId: OrganizationId, deviceId: DeviceId, projectId: ProjectId): Promise<void> {
    const [deviceAndProject, device] = await Promise.all([
      this.dataSource.getRepository(ProjectAndDevice).findOne({ where: { deviceId, projectId } }),
      this.dataSource.getRepository(Device).findOne({ where: { deviceId } }),
    ]);

    if (!device) {
      throw new HttpException(`Cannot find device. deviceId: ${deviceId}`, HttpStatus.NOT_FOUND);
    }

    if (device.isGlobal === 1) {
      if (!deviceAndProject) {
        throw new HttpException(`Public device cannot be deleted from project. deviceId: ${deviceId}`, HttpStatus.BAD_REQUEST);
      }
    }

    if (!deviceAndProject) {
      throw new HttpException(`Cannot find device in project. deviceId: ${deviceId}, projectId: ${projectId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.getRepository(ProjectAndDevice).softRemove(deviceAndProject);
  }

  async updateDevice(organizationId: OrganizationId, deviceId: DeviceId, dto: UpdateDeviceDto): Promise<DeviceResponse> {
    const { name, maxParallelJobs } = dto;
    const [deviceById, deviceByName] = await Promise.all([
      this.dataSource.getRepository(Device).findOne({ where: { deviceId } }),
      this.dataSource.getRepository(Device).findOne({ where: { organizationId, name } }),
    ]);
    if (!deviceById) {
      throw new HttpException(`This device does not exists. : ${deviceId}`, HttpStatus.BAD_REQUEST);
    }
    if (deviceByName) {
      if (deviceById.deviceId !== deviceByName.deviceId) {
        throw new HttpException(`This device name already exists. : ${name}`, HttpStatus.BAD_REQUEST);
      }
    }
    if (maxParallelJobs) {
      if (!validateMaxParallelJobs(deviceById.platform, maxParallelJobs)) {
        throw new HttpException(`maxParallelJobs is invalid. : ${maxParallelJobs}, platform: ${platformTypeFromPlatform(deviceById.platform)}`, HttpStatus.BAD_REQUEST);
      }
    }

    const newData = Object.assign(deviceById, {
      name: name ? name : deviceById.name,
      maxParallelJobs: maxParallelJobs ? maxParallelJobs : deviceById.maxParallelJobs,
    });
    const updateDevice = await this.dataSource.getRepository(Device).save(newData);
    return updateDevice;
  }

  async addTagToDevice(manager: EntityManager, deviceId: DeviceId, dto: AttachTagToDeviceDto): Promise<void> {
    const deviceTagId = dto.tagId;
    const tagAndDevice = await manager.getRepository(DeviceAndDeviceTag).findOne({ where: { deviceId, deviceTagId }, withDeleted: true });

    if (tagAndDevice && tagAndDevice.deletedAt === null) {
      throw new HttpException(`This device already has this tag. : ${dto.tagId}`, HttpStatus.BAD_REQUEST);
    }

    if (tagAndDevice && tagAndDevice.deletedAt !== null) {
      await manager.getRepository(DeviceAndDeviceTag).recover(tagAndDevice);
      return;
    }

    const [tag, device] = await Promise.all([
      manager.getRepository(DeviceTag).findOne({ where: { deviceTagId } }), //
      manager.getRepository(Device).findOne({ where: { deviceId } }),
    ]);

    if (!tag) {
      throw new HttpException(`This tag does not exists. : ${dto.tagId}`, HttpStatus.BAD_REQUEST);
    }
    if (!device) {
      throw new HttpException(`This device does not exists. : ${deviceId}`, HttpStatus.BAD_REQUEST);
    }

    if (Platform.PLATFORM_UNSPECIFIED !== platformFromPlatformType(tag.name as PlatformType)) {
      const devicePlatformName = platformTypeFromPlatform(device.platform);
      if (devicePlatformName !== tag.name) {
        throw new HttpException(`Platform tag and device platform are not matched. ${tag.name}`, HttpStatus.BAD_REQUEST);
      }
    }

    const newData = manager.getRepository(DeviceAndDeviceTag).create({ deviceId, deviceTagId });
    await manager.getRepository(DeviceAndDeviceTag).save(newData);
    return;
  }

  async softRemoveTagFromDevice(organizationId: OrganizationId, deviceId: DeviceId, tagId: DeviceTagId): Promise<void> {
    const tagAndDevice = await this.dataSource //
      .getRepository(DeviceAndDeviceTag)
      .createQueryBuilder('tagAndDevice')
      .innerJoinAndSelect(`tagAndDevice.${DeviceAndDeviceTagPropCamel.deviceTag}`, 'deviceTag')
      .innerJoinAndSelect(`tagAndDevice.${DeviceAndDeviceTagPropCamel.device}`, 'device')
      .where(`tagAndDevice.${DeviceAndDeviceTagPropSnake.device_id} = :deviceId`, { deviceId })
      .andWhere(`tagAndDevice.${DeviceAndDeviceTagPropSnake.device_tag_id} = :tagId`, { tagId })
      .getOne();

    if (!tagAndDevice) {
      throw new HttpException(`This device does not have this tag. Device: ${deviceId}, Tag: ${tagId}`, HttpStatus.BAD_REQUEST);
    }

    const tag = tagAndDevice.deviceTag ?? null;
    const device = tagAndDevice.device ?? null;
    if (tag && device) {
      const devicePlatformName = platformTypeFromPlatform(device.platform);
      if (devicePlatformName === tag.name) {
        throw new HttpException(`This tag is not allowed to delete. name: ${tag.name}`, HttpStatus.BAD_REQUEST);
      }
    }

    await this.dataSource.getRepository(DeviceAndDeviceTag).softRemove(tagAndDevice);

    return;
  }

  async findDeviceWithRelations(deviceId: DeviceId, withDeleted: boolean): Promise<Device | null> {
    const query = withDeleted //
      ? this.dataSource.getRepository(Device).createQueryBuilder('device').withDeleted()
      : this.dataSource.getRepository(Device).createQueryBuilder('device');

    const device = await query //
      .leftJoinAndSelect(`device.${DevicePropCamel.deviceAndDeviceTags}`, 'deviceAndDeviceTag')
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
      .where(`device.${DevicePropCamel.deviceId} = :deviceId`, { deviceId })
      .getOne();

    return device;
  }

  async softRemoveDevice(deviceId: DeviceId): Promise<void> {
    const device = await this.findDeviceWithRelations(deviceId, false);
    if (!device) {
      throw new HttpException(`This device does not exists. : ${deviceId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Device).update(deviceId, { connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED });
      await manager.getRepository(Device).softRemove(device);
    });
  }

  async checkDeviceStreamingAvailable(deviceId: DeviceId): Promise<void> {
    const device = await this.dataSource.getRepository(Device).findOne({ where: { deviceId } });

    if (device) {
      if (
        device.connectionState === DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED ||
        device.connectionState === DeviceConnectionState.DEVICE_CONNECTION_STATE_UNSPECIFIED ||
        device.connectionState === DeviceConnectionState.UNRECOGNIZED
      ) {
        throw new ForbiddenException('Device connection failure.');
      }

      return;
    }

    throw new NotFoundException('Device not found.');
  }

  async findDisabledHostDevice(organizationId: OrganizationId): Promise<Device[]> {
    const rv = await this.dataSource.getRepository(Device).find({ where: { organizationId, isHost: 1, enableHostDevice: 0 } });
    return rv;
  }

  public disabledHostDeviceSubQuery(queryBuilder: SelectQueryBuilder<BaseEntity>, organizationId: OrganizationId, subQueryAlias = 'disabledHostDevice') {
    return queryBuilder
      .subQuery() //
      .select(`${subQueryAlias}.${DevicePropSnake.device_id}`) //
      .from(Device, subQueryAlias) //
      .where(`${subQueryAlias}.${DevicePropSnake.organization_id} = :${DevicePropCamel.organizationId}`, { organizationId })
      .andWhere(`${subQueryAlias}.${DevicePropSnake.is_host}=1`)
      .andWhere(`${subQueryAlias}.${DevicePropSnake.enable_host_device} = 0`)
      .andWhere(`${subQueryAlias}.${DevicePropSnake.deleted_at} IS NULL`);
  }

  public enabledProjectDeviceSubQuery(
    queryBuilder: SelectQueryBuilder<BaseEntity>, //
    organizationId: OrganizationId,
    projectId: ProjectId,
    deviceInProjectAlias = 'deviceInProject',
    enabledProjectDeviceAlias = 'enabledProjectDevice',
  ) {
    const deviceInProjectSubQuery = queryBuilder
      .subQuery()
      .select(`${deviceInProjectAlias}.device_id`)
      .from(ProjectAndDevice, deviceInProjectAlias)
      .where(`${deviceInProjectAlias}.${ProjectAndDevicePropSnake.project_id} = :projectId`, { projectId })
      .andWhere(`${deviceInProjectAlias}.${ProjectAndDevicePropSnake.deleted_at} IS NULL`);

    const disAbledHostDeviceSubQuery = this.disabledHostDeviceSubQuery(queryBuilder, organizationId);

    const enabledProjectDeviceSubQuery = queryBuilder
      .subQuery()
      .select(`${enabledProjectDeviceAlias}.${DevicePropSnake.device_id}`)
      .from(Device, enabledProjectDeviceAlias)
      .where(`${enabledProjectDeviceAlias}.${DevicePropSnake.device_id} IN ${deviceInProjectSubQuery.getQuery()}`)
      .andWhere(`${enabledProjectDeviceAlias}.${DevicePropSnake.device_id} NOT IN ${disAbledHostDeviceSubQuery.getQuery()}`)
      .orWhere(
        new Brackets((qb) => {
          qb.where(`${enabledProjectDeviceAlias}.${DevicePropSnake.is_global} = 1`);
          qb.andWhere(`${enabledProjectDeviceAlias}.${DevicePropSnake.deleted_at} IS NULL`);
          qb.andWhere(`${enabledProjectDeviceAlias}.${DevicePropSnake.organization_id} = :organizationId`, { organizationId });
        }),
      );

    return enabledProjectDeviceSubQuery;
  }

  async findDevicesByName(manager: EntityManager, organizationId: OrganizationId, projectId: ProjectId, names: string[], invalidCheck = false): Promise<Device[]> {
    if (invalidCheck) {
      const targetDevices = await manager.getRepository(Device).find({ where: { organizationId, name: In(names) } });
      if (targetDevices.length === 0) {
        throw new HttpException(`These devices is not organization devices. ${names.join(', ')}`, HttpStatus.NOT_FOUND);
      }
      let inValidDevices: Device[] = [];
      for (const device of targetDevices) {
        if (device.isGlobal === 1) {
          continue;
        }
        const deviceAndProject = await manager.getRepository(ProjectAndDevice).findOne({ where: { deviceId: device.deviceId, projectId } });
        if (!deviceAndProject) {
          inValidDevices.push(device);
        }
      }
      if (inValidDevices.length > 0) {
        throw new HttpException(`These devices is not project devices. ${inValidDevices.map((device) => device.name).join(', ')}`, HttpStatus.NOT_FOUND);
      }
      return targetDevices;
    } else {
      const globalDevices = await manager
        .getRepository(Device)
        .find({ where: { organizationId, isGlobal: 1, name: In(names), connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED } });
      const deviceAndProject = await manager
        .getRepository(ProjectAndDevice) //
        .createQueryBuilder('projectAndDevice')
        .leftJoinAndSelect(
          `projectAndDevice.${ProjectAndDevicePropCamel.device}`,
          'device',
          `device.${DevicePropCamel.name} IN (:...names) AND device.${DevicePropCamel.connectionState}=:connectionState`,
          { names, connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED },
        )
        .where(`projectAndDevice.${ProjectAndDevicePropCamel.projectId} = :projectId`, { projectId })
        .getMany();

      const devicesByProject = deviceAndProject.map((projectAndDevice) => projectAndDevice.device).filter(notEmpty);
      const devices = [...globalDevices, ...devicesByProject];
      return devices;
    }
  }

  async findDevicesByDeviceTag(manager: EntityManager, organizationId: OrganizationId, projectId: ProjectId, deviceTagNames: string[], invalidCheck = false): Promise<Device[]> {
    if (deviceTagNames.length === 0) {
      throw new HttpException('TagNames must not be empty', HttpStatus.BAD_REQUEST);
    }

    const tags = await manager.getRepository(DeviceTag).find({ where: { organizationId, name: In(deviceTagNames) } });

    if (invalidCheck) {
      const invalids: string[] = [];
      deviceTagNames.forEach((tagName) => {
        if (tagName === undefined) {
          throw new HttpException('TagName must not be undefined', HttpStatus.BAD_REQUEST);
        }
        if (!tags.find((tag) => tag.name === tagName)) {
          invalids.push(tagName);
        }
      });
      if (invalids.length > 0) {
        throw new HttpException(`Invalid device tag name: ${invalids.join(', ')}`, HttpStatus.NOT_FOUND);
      }
    }

    // device by organization and project
    const globalDevices = await manager.getRepository(Device).find({ where: { organizationId, isGlobal: 1 } });
    const globalDeviceIds = globalDevices.map((device) => device.deviceId);
    const deviceAndProject = await manager.getRepository(ProjectAndDevice).find({ where: { projectId } });
    const deviceIdsByProject = deviceAndProject.map((deviceAndProject) => deviceAndProject.deviceId);
    const deviceIdsByProjectUniquefied = [...new Set(deviceIdsByProject)];
    const deviceIdsByOrganizations = [...globalDeviceIds, ...deviceIdsByProjectUniquefied];

    // device by tags
    const deviceAndDeviceTags = await manager.getRepository(DeviceAndDeviceTag).find({ where: { deviceTagId: In(tags.map((tag) => tag.deviceTagId)) } });
    const deviceIdsByTags = deviceAndDeviceTags.map((deviceAndDeviceTag) => deviceAndDeviceTag.deviceId);

    // filter org and project
    const deviceIds = deviceIdsByOrganizations.filter((deviceId) => deviceIdsByTags.includes(deviceId));

    const devices = await manager.getRepository(Device).find({ where: { deviceId: In(deviceIds), connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED } });

    return devices;
  }

  async sortDevicesByRunningRate(deviceIds: DeviceId[]): Promise<Device[]> {
    const devicesJoinedByDeviceJobs = await this.dataSource //
      .getRepository(Device)
      .createQueryBuilder('device')
      .leftJoinAndSelect(`device.${DevicePropCamel.routineDeviceJobs}`, 'deviceJob', `deviceJob.status IN (:...status)`, {
        status: [PIPELINE_STATUS.WAITING, PIPELINE_STATUS.IN_PROGRESS, PIPELINE_STATUS.CANCEL_REQUESTED],
      })
      .leftJoinAndSelect(`device.${DevicePropCamel.remoteDeviceJobs}`, 'remoteDeviceJob', `remoteDeviceJob.state IN (:...state)`, {
        state: [REMOTE_DEVICE_JOB_STATE.WAITING, REMOTE_DEVICE_JOB_STATE.IN_PROGRESS],
      })
      .where('device.deviceId IN (:...deviceIds)', { deviceIds })
      .getMany();

    const devicesSortedByCurrentRunningRate = devicesJoinedByDeviceJobs.sort((a, b) => {
      const maxParallelJobsA = a.maxParallelJobs;
      const remoteDeviceJobsA = a.remoteDeviceJobs ?? [];
      const routineDeviceJobsA = a.routineDeviceJobs ?? [];
      const totalCurrentRunningJobsA = remoteDeviceJobsA.length + routineDeviceJobsA.length;
      const currentRunningRateA = totalCurrentRunningJobsA / maxParallelJobsA;

      const maxParallelJobsB = b.maxParallelJobs;
      const remoteDeviceJobsB = b.remoteDeviceJobs ?? [];
      const routineDeviceJobsB = b.routineDeviceJobs ?? [];
      const totalCurrentRunningJobsB = remoteDeviceJobsB.length + routineDeviceJobsB.length;
      const currentRunningRateB = totalCurrentRunningJobsB / maxParallelJobsB;

      return currentRunningRateA - currentRunningRateB;
    });

    return devicesSortedByCurrentRunningRate;
  }
}
