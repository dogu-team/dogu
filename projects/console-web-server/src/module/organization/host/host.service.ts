import { DevicePropCamel, DevicePropSnake, HostBase, HostPropCamel, HostPropSnake, TokenPropSnake } from '@dogu-private/console';
import { DeviceConnectionState, HostConnectionState, HostId, OrganizationId, UserId, UserPayload } from '@dogu-private/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Brackets, DataSource, DeepPartial, In } from 'typeorm';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { v4 } from 'uuid';
import { Device } from '../../../db/entity/device.entity';
import { Host } from '../../../db/entity/host.entity';
import { DeviceAndDeviceTag, ProjectAndDevice } from '../../../db/entity/index';
import { Token } from '../../../db/entity/token.entity';
import { Page } from '../../common/dto/pagination/page';
import { DoguLogger } from '../../logger/logger';
import { TokenService } from '../../token/token.service';
import { DeviceStatusService } from '../device/device-status.service';
import { CreateHostDto, FindHostsByOrganizationIdDto, UpdateHostNameDto } from './dto/host.dto';

@Injectable()
export class HostService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,

    @Inject(DeviceStatusService)
    private readonly deviceStatusService: DeviceStatusService,
  ) {}

  async findHostsByOrganizationId(userPayload: UserPayload, organizationId: OrganizationId, dto: FindHostsByOrganizationIdDto): Promise<Page<HostBase>> {
    const disabledHostdevices = await this.deviceStatusService.findDisabledHostDevice(organizationId);
    const disableHostdeviceIds =
      disabledHostdevices.map((device) => device.deviceId).length > 0 ? disabledHostdevices.map((device) => device.deviceId) : ['00000000-0000-0000-0000-000000000000'];

    const rv = await this.dataSource //
      .getRepository(Host)
      .createQueryBuilder('host')
      .leftJoinAndSelect(`host.${HostPropSnake.creator}`, 'user')
      .leftJoinAndSelect(`host.${HostPropCamel.devices}`, 'device', `device.${DevicePropSnake.device_id} NOT IN (:...disableHostdeviceIds)`, { disableHostdeviceIds })
      .leftJoinAndSelect(`host.${HostPropCamel.hostDevice}`, 'hostDevice', `hostDevice.${DevicePropSnake.is_host} = :isHostDevice`, { isHostDevice: 1 })
      .leftJoin(`host.${HostPropCamel.token}`, 'token')
      .where(`host.${HostPropSnake.organization_id} = :organizationId`, { organizationId })
      .andWhere(`host.${HostPropSnake.name} ILIKE :name`, { name: `%${dto.keyword}%` })
      .andWhere(`token.${TokenPropSnake.token} LIKE :token`, { token: `%${dto.token ?? ''}%` })
      .andWhere(
        new Brackets((qb) => {
          qb.where(`device.${DevicePropSnake.organization_id} = :organizationId`, { organizationId }).orWhere(`device.${DevicePropSnake.device_id} IS NULL`);
        }),
      )
      .orderBy(`host.${HostPropCamel.connectionState}`, 'DESC')
      .addOrderBy(`host.${HostPropCamel.name}`, 'ASC')
      .take(dto.getDBLimit())
      .skip(dto.getDBOffset())
      .getManyAndCount();

    const host = rv[0];
    const totalCount = rv[1];

    const page = new Page<HostBase>(dto.page, dto.offset, totalCount, host);
    return page;
  }

  async getCurrentHostToken(hostId: HostId): Promise<string> {
    const host = await this.dataSource //
      .getRepository(Host)
      .createQueryBuilder('host')
      .innerJoinAndSelect(`host.${HostPropSnake.token}`, 'token')
      .where(`host.${HostPropSnake.host_id} = :hostId`, { hostId })
      .getOne();

    if (!host) {
      throw new HttpException(`This host name is not registered. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }

    const token = host.token;
    if (!token) {
      throw new HttpException(`This host does not have token. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }

    if (TokenService.isExpired(token)) {
      throw new HttpException(`This host token is expired. Please regenerate token. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }

    return token.token;
  }

  async reissueHostToken(hostId: HostId): Promise<string> {
    const host = await this.dataSource //
      .getRepository(Host)
      .createQueryBuilder('host')
      .innerJoinAndSelect(`host.${HostPropSnake.token}`, 'token')
      .where(`host.${HostPropSnake.host_id} = :hostId`, { hostId })
      .getOne();
    if (!host) {
      throw new HttpException(`This host name is not registered. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }

    const rv = await this.dataSource.transaction(async (manager) => {
      // token
      const newTokenData: DeepPartial<Token> = {
        token: TokenService.createHostToken(),
      };
      const tokenData = manager.getRepository(Token).create(newTokenData);
      const token = await manager.getRepository(Token).save(tokenData);
      await manager.getRepository(Token).softDelete({ tokenId: host.tokenId });
      await manager.getRepository(Host).update({ hostId }, { tokenId: token.tokenId });
      return token.token;
    });

    return rv;
  }

  async createHost(organizationId: OrganizationId, creatorId: UserId, dto: CreateHostDto): Promise<string> {
    const { name } = dto;
    const data = await this.dataSource.getRepository(Host).findOne({
      where: { name: dto.name, organizationId },
    });
    if (data) {
      throw new HttpException(`This host name is already registered. : ${dto.name}`, HttpStatus.CONFLICT);
    }

    const rv = await this.dataSource.transaction(async (manager) => {
      // token
      const newTokenData: DeepPartial<Token> = {
        token: TokenService.createHostToken(),
        expiredAt: null,
      };
      const tokenData = manager.getRepository(Token).create(newTokenData);
      const token = await manager.getRepository(Token).save(tokenData);

      // host
      const newHostData: DeepPartial<Host> = {
        hostId: v4(),
        name,
        organizationId,
        creatorId,
        tokenId: token.tokenId,
      };
      const hostData = manager.getRepository(Host).create(newHostData);
      const host = await manager.getRepository(Host).save(hostData);

      return token.token;
    });

    return rv;
  }

  async updateHostName(hostId: HostId, dto: UpdateHostNameDto): Promise<HostBase> {
    const host: Host | null = await this.dataSource.getRepository(Host).findOne({
      where: { hostId: hostId },
    });
    if (host) {
      const duplicatedNamedHost = await this.dataSource.getRepository(Host).findOne({
        where: { organizationId: host.organizationId, name: dto.name },
      });

      if (duplicatedNamedHost) {
        throw new HttpException(`Duplicated name: ${dto.name}`, HttpStatus.CONFLICT);
      }

      const newData = Object.assign(host, dto);
      const rv = await this.dataSource.getRepository(Host).save(newData);
      return rv;
    } else {
      throw new HttpException(`This host id does not exists. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }
  }

  async enableHostDevice(hostId: HostId): Promise<void> {
    const host = await this.dataSource //
      .getRepository(Host)
      .createQueryBuilder('host')
      .leftJoinAndSelect(`host.${HostPropCamel.hostDevice}`, 'hostDevice', `hostDevice.${DevicePropSnake.is_host} = :isHostDevice`, { isHostDevice: 1 })
      .where(`host.${HostPropSnake.host_id} = :hostId`, { hostId })
      .getOne();
    if (!host) {
      throw new HttpException(`This host id does not exists. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }
    if (!host.hostDevice) {
      throw new HttpException(`This host does not have host device. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }
    if (host.hostDevice.connectionState !== DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED) {
      throw new HttpException(`This host device is not connected. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }
    if (host.hostDevice.enableHostDevice === 1) {
      throw new HttpException(`This host device is already enabled. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }

    await this.dataSource.getRepository(Device).update(host.hostDevice.deviceId, { enableHostDevice: 1 });
  }

  async disableHostDevice(hostId: HostId): Promise<void> {
    const host = await this.dataSource //
      .getRepository(Host)
      .createQueryBuilder('host')
      .leftJoinAndSelect(`host.${HostPropCamel.hostDevice}`, 'hostDevice', `hostDevice.${DevicePropSnake.is_host} = :isHostDevice`, { isHostDevice: 1 })
      .where(`host.${HostPropSnake.host_id} = :hostId`, { hostId })
      .getOne();
    if (!host) {
      throw new HttpException(`This host id does not exists. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }
    const hostDevice = host.hostDevice;
    if (!hostDevice) {
      throw new HttpException(`This host does not have host device. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }
    if (hostDevice.enableHostDevice === 0) {
      throw new HttpException(`This host device is already disabled. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Device).update(hostDevice.deviceId, { enableHostDevice: 0, isGlobal: 0 });
      await manager.getRepository(ProjectAndDevice).softDelete({ deviceId: hostDevice.deviceId });
      await manager.getRepository(DeviceAndDeviceTag).softDelete({ deviceId: hostDevice.deviceId });
    });
  }

  async softRemoveHost(hostId: HostId): Promise<void> {
    const host = await this.dataSource //
      .getRepository(Host)
      .createQueryBuilder('host')
      .leftJoinAndSelect(`host.${HostPropSnake.devices}`, 'device')
      .leftJoinAndSelect(`device.${DevicePropCamel.projectAndDevices}`, 'projectAndDevice')
      .leftJoinAndSelect(`device.${DevicePropCamel.deviceAndDeviceTags}`, 'deviceAndDeviceTag')
      .where(`host.${HostPropSnake.host_id} = :hostId`, { hostId })
      .getOne();

    if (!host) {
      throw new HttpException(`This host id does not exists. : ${hostId}`, HttpStatus.BAD_REQUEST);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Host).update(hostId, { connectionState: HostConnectionState.HOST_CONNECTION_STATE_DISCONNECTED });
      // host
      await manager.getRepository(Host).softRemove(host);
      // token
      await manager.getRepository(Token).softRemove({ tokenId: host.tokenId });
      // device
      const devices = host.devices ?? [];
      const deviceIds = devices.map((device) => device.deviceId);
      await manager.getRepository(Device).update({ deviceId: In(deviceIds) }, { connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED });
      await manager.getRepository(Device).softDelete({ deviceId: In(deviceIds) });
      // deviceAndProject
      await manager.getRepository(ProjectAndDevice).softDelete({ deviceId: In(deviceIds) });
      // tagAndDevice
      await manager.getRepository(DeviceAndDeviceTag).softDelete({ deviceId: In(deviceIds) });
    });
  }

  async findAllHosts(option: FindOneOptions<Host>): Promise<Host[]> {
    return await this.dataSource.getRepository(Host).find(option);
  }

  async findHost(hostId: HostId): Promise<HostBase> {
    const host = await this.dataSource.getRepository(Host).findOne({
      where: { hostId },
      relations: ['creator', 'devices'],
    });

    if (!host) {
      throw new HttpException(`This host id is not exists. : ${hostId}`, HttpStatus.NOT_FOUND);
    }

    return host;
  }
}
