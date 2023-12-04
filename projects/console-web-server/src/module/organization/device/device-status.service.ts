import {
  DeviceAndDeviceTagPropCamel,
  DeviceAndDeviceTagPropSnake,
  DeviceBase,
  DeviceBrowserInstallationPropCamel,
  DevicePropCamel,
  DevicePropSnake,
  DeviceResponse,
  DeviceTagPropCamel,
  GetEnabledDeviceCountResponse,
  ProjectAndDevicePropCamel,
  ProjectAndDevicePropSnake,
  ProjectBase,
  RemoteDeviceJobPropCamel,
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
import { BrowserInstallation } from '@dogu-tech/device-client-common';
import { ForbiddenException, forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseEntity, Brackets, DataSource, EntityManager, In, IsNull, Not, SelectQueryBuilder } from 'typeorm';
import { v4 } from 'uuid';

import { DeviceRunner } from '../../../db/entity/device-runner.entity';
import { Device } from '../../../db/entity/device.entity';
import { DeviceBrowserInstallation, DeviceTag, Organization, Project } from '../../../db/entity/index';
import { DeviceAndDeviceTag } from '../../../db/entity/relations/device-and-device-tag.entity';
import { ProjectAndDevice } from '../../../db/entity/relations/project-and-device.entity';
import { SelfHostedLicenseValidator } from '../../../enterprise/module/license/common/validation';
import { SelfHostedLicenseService } from '../../../enterprise/module/license/self-hosted-license.service';
import { FeatureConfig } from '../../../feature.config';
import { Page } from '../../common/dto/pagination/page';
import { TokenService } from '../../token/token.service';
import { DeviceTagService } from '../device-tag/device-tag.service';
import {
  AttachTagToDeviceDto,
  EnableDeviceDto,
  FindAddableDevicesByOrganizationIdDto,
  FindDevicesByOrganizationIdDto,
  UpdateDeviceDto,
  UpdateDeviceMaxParallelJobsDto,
} from './dto/device.dto';

@Injectable()
export class DeviceStatusService {
  constructor(
    @Inject(SelfHostedLicenseService)
    private readonly selfHostedLicenseService: SelfHostedLicenseService,
    @Inject(forwardRef(() => DeviceTagService))
    private readonly tagService: DeviceTagService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getEnabledDeviceCount(): Promise<GetEnabledDeviceCountResponse> {
    if (FeatureConfig.get('licenseModule') !== 'self-hosted') {
      throw new NotImplementedException(`This feature is not supported in cloud.`);
    }

    const rootOrganization = await this.dataSource.getRepository(Organization).createQueryBuilder('organization').orderBy('organization.createdAt', 'ASC').getOne();

    if (!rootOrganization) {
      throw new NotFoundException(`Cannot find root's organization.`);
    }

    const enabledHostDevices = await DeviceStatusService.findEnabledHostDevices(this.dataSource.manager, rootOrganization.organizationId);
    const enabledMobileDevices = await DeviceStatusService.findEnabledMobileDevices(this.dataSource.manager, rootOrganization.organizationId);

    const enabledMobileCount = enabledMobileDevices.length;
    const enabledHostRunnerCount = enabledHostDevices.map((device) => device.maxParallelJobs).reduce((a, b) => a + b, 0);

    const rv: GetEnabledDeviceCountResponse = {
      enabledMobileCount,
      enabledBrowserCount: enabledHostRunnerCount,
    };

    return rv;
  }

  async findDevicesByOrganizationId(userPayload: UserPayload, organizationId: OrganizationId, dto: FindDevicesByOrganizationIdDto): Promise<Page<DeviceResponse>> {
    const projectIdFilterClause = dto.projectIds.length !== 0 ? 'project.project_id IN (:...projectIds)' : '1=1';
    const connectionStateFilterClause = dto.connectionStates.length !== 0 ? 'device.connection_state IN (:...connectionStates)' : '1=1';
    const tagNameFilterCluase = dto.tagNames.length !== 0 ? 'deviceTag.name IN (:...tagNames)' : '1=1';
    const hostIdFilterClause = !!dto.hostId ? 'host.host_id = :hostId' : '1=1';

    const isGlobalFilter =
      dto.projectIds.length === 0 //
        ? `(device.is_global = 1
        AND device.organization_id = '${organizationId}'
        AND device.name ILIKE '%${dto.deviceName}%'
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
      .leftJoinAndSelect(`device.${DevicePropCamel.remoteDeviceJobs}`, 'remoteDeviceJob', `remoteDeviceJob.${RemoteDeviceJobPropCamel.sessionState} IN (:...sessionStates)`, {
        sessionStates: [REMOTE_DEVICE_JOB_STATE.WAITING, REMOTE_DEVICE_JOB_STATE.IN_PROGRESS],
      })
      .leftJoinAndSelect(`device.${DevicePropCamel.deviceRunners}`, 'deviceRunner')
      .where('organization.organization_id = :organizationId', { organizationId })
      // for cookapps
      .andWhere(dto.excludeHostIds.length > 0 ? `device.${DevicePropCamel.hostId} NOT IN (:...hostIds)` : '1=1', { hostIds: dto.excludeHostIds })
      .andWhere('device.name ILIKE :name', { name: `%${dto.deviceName}%` })
      .andWhere(projectIdFilterClause, { projectIds: dto.projectIds })
      .andWhere(hostIdFilterClause, { hostId: dto.hostId })
      .andWhere('project.project_id IS NOT NULL')
      .andWhere(connectionStateFilterClause, { connectionStates: dto.connectionStates })
      .andWhere(tagNameFilterCluase, { tagNames: dto.tagNames })
      .orWhere(isGlobalFilter)
      .orderBy(`device.${DevicePropSnake.connection_state}`, 'DESC')
      .addOrderBy(`device.${DevicePropSnake.name}`, 'ASC')
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
      .leftJoinAndSelect(`device.${DevicePropCamel.deviceRunners}`, 'deviceRunner')
      .where('device.organization_id = :organizationId', { organizationId })
      .andWhere(`device.${DevicePropSnake.device_id} NOT IN ${projectDeviceSubQuery.getQuery()}`)
      .andWhere(`device.${DevicePropSnake.device_id} NOT IN ${hostDeviceSubQuery.getQuery()}`)
      .andWhere(`device.${DevicePropSnake.is_global} = 0`)
      .andWhere(`device.${DevicePropSnake.name} ILIKE :name`, { name: `%${dto.deviceName}%` })
      .innerJoinAndSelect(`device.${DevicePropCamel.host}`, 'host')
      .andWhere(hostIdFilterClause, { hostId: dto.hostId })
      .orderBy(`device.${DevicePropSnake.connection_state}`, 'DESC')
      .addOrderBy(`device.${DevicePropSnake.name}`, 'ASC')
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
      .leftJoinAndSelect(`device.${DevicePropCamel.deviceRunners}`, 'deviceRunner')
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
    const { projectId, isGlobal } = dto;
    const device = await this.dataSource
      .getRepository(Device) //
      .createQueryBuilder('device')
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
      .where(`device.${DevicePropCamel.deviceId} = :deviceId`, { deviceId })
      .andWhere(`device.${DevicePropCamel.organizationId} = :organizationId`, { organizationId })
      .getOne();

    if (!device) {
      throw new HttpException(`Cannot find device. deviceId: ${deviceId}`, HttpStatus.NOT_FOUND);
    }

    if (FeatureConfig.get('licenseModule') === 'self-hosted') {
      if (projectId || isGlobal) {
        const license = await this.selfHostedLicenseService.getLicenseInfo(organizationId);

        const isExpired = TokenService.isExpired(license.expiredAt);

        if (device.isHost) {
          const enabledHostDevices = await DeviceStatusService.findEnabledHostDevices(this.dataSource.manager, organizationId);
          const enabledHostRunnerCount = enabledHostDevices.map((device) => device.maxParallelJobs).reduce((a, b) => a + b, 0);
          const maximumBrowserCount = SelfHostedLicenseValidator.getMaxmiumBrowserCount(license);

          if (enabledHostRunnerCount + device.maxParallelJobs > maximumBrowserCount) {
            throw new HttpException(`License browser runner count is not enough. license browser runner count: ${maximumBrowserCount}`, HttpStatus.PAYMENT_REQUIRED);
          }
        } else {
          const enabledMobileDevices = await DeviceStatusService.findEnabledMobileDevices(this.dataSource.manager, organizationId);
          const enabledMobileCount = enabledMobileDevices.length;
          const maximumMobileCount = SelfHostedLicenseValidator.getMaxmiumMobileCount(license);

          if (enabledMobileCount + 1 > maximumMobileCount) {
            throw new HttpException(`License mobile device count is not enough. license mobile device count: ${maximumMobileCount}`, HttpStatus.PAYMENT_REQUIRED);
          }
        }
      }
    }

    await this.dataSource.transaction(async (manager) => {
      if (isGlobal === true) {
        const deviceAndProjects = await manager.getRepository(ProjectAndDevice).find({ where: { deviceId } });
        if (deviceAndProjects.length > 0) {
          await manager.getRepository(ProjectAndDevice).softRemove(deviceAndProjects);
        }
        await manager.getRepository(Device).update({ deviceId }, { isGlobal: 1 });
      } else if (projectId) {
        const deviceAndProject = await manager.getRepository(ProjectAndDevice).findOne({ where: { deviceId, projectId }, withDeleted: true });
        if (deviceAndProject) {
          if (deviceAndProject.deletedAt) {
            await manager.getRepository(ProjectAndDevice).recover(deviceAndProject);
          }
          await manager.getRepository(Device).update({ deviceId }, { isGlobal: 0 });
        } else {
          const newData = manager.getRepository(ProjectAndDevice).create({ deviceId, projectId });
          await manager.getRepository(ProjectAndDevice).save(newData);
          await manager.getRepository(Device).update({ deviceId }, { isGlobal: 0 });
        }
      } else {
        await manager.getRepository(Device).update({ deviceId }, { isGlobal: 0 });
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

  async updateDeviceMaxParallelJobs(manager: EntityManager, organizationId: OrganizationId, deviceId: DeviceId, dto: UpdateDeviceMaxParallelJobsDto): Promise<DeviceResponse> {
    const { maxParallelJobs } = dto;
    // const device = await manager.getRepository(Device).findOne({ where: { deviceId, organizationId, isHost: 1 } });

    const device = await manager
      .getRepository(Device) //
      .createQueryBuilder('device')
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
      .where(`device.${DevicePropCamel.deviceId} = :deviceId`, { deviceId })
      .andWhere(`device.${DevicePropCamel.organizationId} = :organizationId`, { organizationId })
      .andWhere(`device.${DevicePropCamel.isHost} = :isHost`, { isHost: 1 })
      .getOne();

    if (!device) {
      throw new HttpException(`This device does not exists. : ${deviceId}`, HttpStatus.BAD_REQUEST);
    }

    if (maxParallelJobs) {
      if (!validateMaxParallelJobs(device.platform, maxParallelJobs)) {
        throw new HttpException(`maxParallelJobs is invalid. : ${maxParallelJobs}, platform: ${platformTypeFromPlatform(device.platform)}`, HttpStatus.BAD_REQUEST);
      }
    }

    if (device.isGlobal === 1 || (device.projectAndDevices && device.projectAndDevices.length > 0)) {
      if (FeatureConfig.get('licenseModule') === 'self-hosted') {
        const license = await this.selfHostedLicenseService.getLicenseInfo(organizationId);
        const enabledHostDevices = await DeviceStatusService.findEnabledHostDevices(this.dataSource.manager, organizationId);
        const enabledHostRunnerCount = enabledHostDevices.map((device) => device.maxParallelJobs).reduce((a, b) => a + b, 0);
        const maximumBrowserCount = SelfHostedLicenseValidator.getMaxmiumBrowserCount(license);

        if (enabledHostRunnerCount + maxParallelJobs - device.maxParallelJobs > maximumBrowserCount) {
          throw new HttpException(`License browser runner count is not enough. license browser runner count: ${maximumBrowserCount}`, HttpStatus.PAYMENT_REQUIRED);
        }
      }
    }

    const newData = Object.assign(device, {
      maxParallelJobs,
    });

    const updateDevice = await manager.getRepository(Device).save(newData);
    await DeviceStatusService.updateDeviceRunners(manager, deviceId);
    return updateDevice;
  }

  async updateDevice(manager: EntityManager, organizationId: OrganizationId, deviceId: DeviceId, dto: UpdateDeviceDto): Promise<DeviceResponse> {
    const { name } = dto;
    const deviceById = await manager.getRepository(Device).findOne({ where: { deviceId } });
    const deviceByName = await manager.getRepository(Device).findOne({ where: { organizationId, name } });
    const nameTag = await manager.getRepository(DeviceTag).findOne({ where: { organizationId, name: dto.name } });

    if (nameTag) {
      throw new HttpException(`This name is already used in device tag: ${name}`, HttpStatus.BAD_REQUEST);
    }

    if (!deviceById) {
      throw new HttpException(`This device does not exists. : ${deviceId}`, HttpStatus.BAD_REQUEST);
    }
    if (deviceByName) {
      if (deviceById.deviceId !== deviceByName.deviceId) {
        throw new HttpException(`This device name already exists. : ${name}`, HttpStatus.BAD_REQUEST);
      }
    }

    const newData = Object.assign(deviceById, {
      name: name ? name : deviceById.name,
    });
    const updateDevice = await manager.getRepository(Device).save(newData);
    await DeviceStatusService.updateDeviceRunners(manager, deviceId);
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

  async findDeviceByDeviceTagWithBrowser(
    manager: EntityManager,
    organizationId: OrganizationId,
    projectId: ProjectId,
    deviceTag: string,
    browserName: string,
    invalidCheck = false,
  ): Promise<Device | null> {
    if (invalidCheck) {
      const tags = await manager.getRepository(DeviceTag).find({ where: { organizationId, name: In([deviceTag]) } });
      if (tags.length === 0) {
        throw new HttpException(`Invalid device tag name: ${deviceTag}`, HttpStatus.NOT_FOUND);
      }
    }

    const device = await manager
      .createQueryBuilder(Device, Device.name)
      .leftJoinAndSelect(`${Device.name}.${DevicePropCamel.deviceAndDeviceTags}`, DeviceAndDeviceTag.name)
      .leftJoinAndSelect(`${Device.name}.${DevicePropCamel.projectAndDevices}`, ProjectAndDevice.name)
      .leftJoinAndSelect(`${Device.name}.${DevicePropCamel.deviceBrowserInstallations}`, DeviceBrowserInstallation.name)
      .leftJoinAndSelect(`${DeviceAndDeviceTag.name}.${DeviceAndDeviceTagPropCamel.deviceTag}`, DeviceTag.name)
      .where(`${Device.name}.${DevicePropCamel.organizationId} = :${DevicePropCamel.organizationId}`, { organizationId })
      .andWhere(`${DeviceTag.name}.${DeviceTagPropCamel.name} = :${DeviceTagPropCamel.name}`, { name: deviceTag, organizationId })
      .andWhere(`${Device.name}.${DevicePropCamel.connectionState} = :${DevicePropCamel.connectionState}`, {
        connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED,
      })
      .andWhere(
        new Brackets((builder) => {
          builder
            .where(`${Device.name}.${DevicePropCamel.isGlobal} = 1`) //
            .orWhere(`${ProjectAndDevice.name}.${ProjectAndDevicePropCamel.projectId} = :${ProjectAndDevicePropCamel.projectId}`, { projectId });
        }),
      )
      .andWhere(
        new Brackets((builder) => {
          builder
            .where(`${Device.name}.${DevicePropCamel.isHost} = 1`) //
            .orWhere(
              `${Device.name}.${DevicePropCamel.isHost} = 0 AND ${DeviceBrowserInstallation.name}.${DeviceBrowserInstallationPropCamel.browserName} = :${DeviceBrowserInstallationPropCamel.browserName}`,
              {
                browserName,
              },
            );
        }),
      )
      .getOne();

    return device;
  }

  async sortDevicesByRunningRate(deviceIds: DeviceId[]): Promise<Device[]> {
    const devicesJoinedByDeviceJobs = await this.dataSource //
      .getRepository(Device)
      .createQueryBuilder('device')
      .leftJoinAndSelect(`device.${DevicePropCamel.routineDeviceJobs}`, 'deviceJob', `deviceJob.status IN (:...status)`, {
        status: [PIPELINE_STATUS.WAITING, PIPELINE_STATUS.IN_PROGRESS, PIPELINE_STATUS.CANCEL_REQUESTED],
      })
      .leftJoinAndSelect(`device.${DevicePropCamel.remoteDeviceJobs}`, 'remoteDeviceJob', `remoteDeviceJob.${RemoteDeviceJobPropCamel.sessionState} IN (:...sessionStates)`, {
        sessionStates: [REMOTE_DEVICE_JOB_STATE.WAITING, REMOTE_DEVICE_JOB_STATE.IN_PROGRESS],
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

  static async findEnabledHostDevices(manager: EntityManager, organizationId: OrganizationId): Promise<Device[]> {
    const hostDevices = await manager
      .getRepository(Device) //
      .createQueryBuilder('device')
      .where(`device.${DevicePropSnake.is_host} = :${DevicePropCamel.isHost}`, { isHost: 1 })
      .andWhere(`device.${DevicePropSnake.organization_id} = :${DevicePropCamel.organizationId}`, { organizationId })
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
      .getMany();
    const globalHostDevices = hostDevices.filter((device) => device.isGlobal === 1);
    const projectHostDevices = hostDevices.filter((device) => {
      return device.isGlobal === 0 && device.projectAndDevices && device.projectAndDevices.length > 0;
    });

    const enabledHostDevices = [...globalHostDevices, ...projectHostDevices];
    return enabledHostDevices;
  }

  static async findEnabledMobileDevices(manager: EntityManager, organizationId: OrganizationId): Promise<Device[]> {
    const mobileDevices = await manager
      .getRepository(Device) //
      .createQueryBuilder('device')
      .where(`device.${DevicePropSnake.is_host} = :${DevicePropCamel.isHost}`, { isHost: 0 })
      .andWhere(`device.${DevicePropSnake.organization_id} = :${DevicePropCamel.organizationId}`, { organizationId })
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
      .getMany();
    const globalDevices = mobileDevices.filter((device) => device.isGlobal === 1);
    const projectDevices = mobileDevices.filter((device) => {
      return device.isGlobal === 0 && device.projectAndDevices && device.projectAndDevices.length > 0;
    });

    const enabledMobildDevices = [...globalDevices, ...projectDevices];
    return enabledMobildDevices;
  }

  static async updateDeviceBrowserInstallations(manager: EntityManager, deviceId: DeviceId, browserInstallations: BrowserInstallation[]): Promise<void> {
    const olds = await manager.getRepository(DeviceBrowserInstallation).find({ where: { deviceId } });
    const news = browserInstallations;
    const minLength = Math.min(olds.length, news.length);
    for (let i = 0; i < minLength; i++) {
      const old = olds[i];
      const newOne = news[i];
      await manager.getRepository(DeviceBrowserInstallation).update(
        { deviceBrowserInstallationId: old.deviceBrowserInstallationId },
        {
          browserName: newOne.browserName,
          browserVersion: newOne.browserVersion,
          deviceId,
        },
      );
    }

    if (news.length > olds.length) {
      const addeds = news.slice(olds.length);
      const createds = manager.getRepository(DeviceBrowserInstallation).create(
        addeds.map((v) => ({
          deviceBrowserInstallationId: v4(),
          browserName: v.browserName,
          browserVersion: v.browserVersion,
          deviceId,
        })),
      );
      await manager.getRepository(DeviceBrowserInstallation).save(createds);
    } else if (news.length < olds.length) {
      const deleteds = olds.slice(news.length);
      await manager.getRepository(DeviceBrowserInstallation).softDelete(deleteds.map((v) => v.deviceBrowserInstallationId));
    }
  }

  static async updateDeviceRunners(manager: EntityManager, deviceId: DeviceId): Promise<void> {
    const device = await manager.getRepository(Device).findOne({ where: { deviceId }, select: [DevicePropCamel.deviceId, DevicePropCamel.maxParallelJobs] });
    if (!device) {
      throw new HttpException(`Cannot find device. deviceId: ${deviceId}`, HttpStatus.NOT_FOUND);
    }

    const isInUse = await manager.getRepository(DeviceRunner).exist({ where: { deviceId, isInUse: 1 } });
    if (isInUse) {
      throw new HttpException(`Device is in use now. deviceId: ${deviceId}`, HttpStatus.BAD_REQUEST);
    }

    const toUpdateCount = device.maxParallelJobs;
    const currentCount = await manager.getRepository(DeviceRunner).count({ where: { deviceId } });
    const toRecoverOrCreateCount = Math.max(0, toUpdateCount - currentCount);
    if (toRecoverOrCreateCount > 0) {
      // const softDeletedCount = await manager.getRepository(DeviceRunner).count({ where: { deviceId }, withDeleted: true });
      const softDeletedCount = await manager.getRepository(DeviceRunner).count({ where: { deviceId, deletedAt: Not(IsNull()) }, withDeleted: true });
      const toRecoverCount = Math.min(toRecoverOrCreateCount, softDeletedCount);
      if (toRecoverCount > 0) {
        // const softDeleteds = await manager.getRepository(DeviceRunner).find({ where: { deviceId }, withDeleted: true, take: toRecoverCount });
        const softDeleteds = await manager.getRepository(DeviceRunner).find({ where: { deviceId, deletedAt: Not(IsNull()) }, withDeleted: true, take: toRecoverCount });
        await manager.getRepository(DeviceRunner).recover(softDeleteds);
      }

      const toCreateCount = Math.max(0, toRecoverOrCreateCount - toRecoverCount);
      if (toCreateCount > 0) {
        const toCreates = manager.getRepository(DeviceRunner).create(
          Array.from({ length: toCreateCount }).map(() => ({
            deviceRunnerId: v4(),
            deviceId,
          })),
        );
        await manager.getRepository(DeviceRunner).save(toCreates);
      }
    }

    const toRemoveCount = Math.max(0, currentCount - toUpdateCount);
    if (toRemoveCount > 0) {
      const deviceRunners = await manager.getRepository(DeviceRunner).find({ where: { deviceId }, take: toRemoveCount });
      await manager.getRepository(DeviceRunner).softDelete(deviceRunners.map((deviceRunner) => deviceRunner.deviceRunnerId));
    }
  }
}
