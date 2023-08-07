import { DevicePropCamel, HostPropCamel, ProjectPropCamel, ProjectPropSnake } from '@dogu-private/console';
import { DeviceId, HostId, HostPayload, OrganizationId, ProjectId } from '@dogu-private/types';
import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { Device } from '../../../db/entity/device.entity';
import { Host } from '../../../db/entity/host.entity';
import { Project } from '../../../db/entity/project.entity';
import { Token } from '../../../db/entity/token.entity';
import { DoguLogger } from '../../logger/logger';
import { TokenService } from '../../token/token.service';
import { HOST_ACTION_TYPE } from '../auth.types';

@Injectable()
export class AuthHostService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  public async validateHostWithCtx(ctx: ExecutionContext, type: HOST_ACTION_TYPE): Promise<HostPayload | null> {
    const req = ctx.switchToHttp().getRequest<Request>();
    return this.validateHostWithRequest(req, type);
  }

  public async validateHostWithRequest(req: Request, type: HOST_ACTION_TYPE): Promise<HostPayload | null> {
    const deviceId = req.params.deviceId;
    const hostId = req.params.hostId;
    const organizationId = req.params.organizationId;
    const projectId = req.params.projectId;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.validateHost(organizationId, projectId, hostId, deviceId, authHeader, type);
  }

  public async validateHost(
    organizationId: OrganizationId,
    projectId: ProjectId,
    hostId: HostId,
    deviceId: DeviceId,
    authHeader: string,
    type: HOST_ACTION_TYPE,
  ): Promise<HostPayload | null> {
    const hostToken = authHeader.split(' ')[1];

    switch (type) {
      case HOST_ACTION_TYPE.CREATE_HOST_API: {
        const host = await this.validateHostToken(hostToken);
        return { hostId: host.hostId };
      }
      case HOST_ACTION_TYPE.HOST_API: {
        const rv = await this.validateHostApi(organizationId, hostToken);
        return rv;
      }
      case HOST_ACTION_TYPE.DEVICE_API: {
        const host = await this.validateDeviceApi(organizationId, deviceId, hostToken);
        return { hostId: host.hostId };
      }
      case HOST_ACTION_TYPE.CREATE_DEVICE_API: {
        const rv = await this.validateCreateDeviceApi(organizationId, hostToken);
        return rv;
      }
      case HOST_ACTION_TYPE.PROJECT_ACTION_API: {
        const rv = await this.validateProjectActionApi(organizationId, projectId, hostToken);
        return rv;
      }
      default:
        const _exhaustiveCheck: never = type;
    }
    return { hostId };
  }

  private async validateHostToken(hostToken: string): Promise<Host> {
    const token = await this.dataSource.getRepository(Token).findOne({ where: { token: hostToken } });
    if (!token) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const host = await this.dataSource.getRepository(Host).findOne({ where: { tokenId: token.tokenId } });
    if (!host) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (TokenService.isExpired(token)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return host;
  }

  private async validateHostApi(organizationId: OrganizationId, hostToken: string): Promise<HostPayload> {
    const host = await this.validateHostToken(hostToken);

    if (host.organizationId !== organizationId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return { hostId: host.hostId };
  }

  private async validateCreateDeviceApi(organizationId: OrganizationId, hostToken: string): Promise<HostPayload> {
    const host = await this.validateHostToken(hostToken);

    if (host.organizationId !== organizationId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return { hostId: host.hostId };
  }

  private async validateDeviceApi(organizationId: OrganizationId, deviceId: DeviceId, hostToken: string): Promise<HostPayload> {
    const host = await this.validateHostToken(hostToken);

    const device = await this.dataSource //
      .getRepository(Device)
      .createQueryBuilder('device')
      .innerJoinAndSelect(`device.${DevicePropCamel.host}`, 'host')
      .innerJoinAndSelect(`host.${HostPropCamel.token}`, 'token')
      .where(`device.${DevicePropCamel.deviceId} = :deviceId`, { deviceId })
      .getOne();
    if (!device) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (host.organizationId !== organizationId || device.organizationId !== organizationId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return { hostId: host.hostId };
  }

  private async validateProjectActionApi(organizationId: OrganizationId, projectId: ProjectId, hostToken: string): Promise<HostPayload> {
    const host = await this.validateHostToken(hostToken);
    const project = await this.dataSource //
      .getRepository(Project)
      .createQueryBuilder('project')
      .innerJoinAndSelect(`project.${ProjectPropCamel.organization}`, 'organization')
      .where(`project.${ProjectPropSnake.project_id} = :projectId`, { projectId })
      .getOne();
    if (!project) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const organization = project.organization;
    if (!organization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (project.organizationId !== organizationId || organization.organizationId !== organizationId || host.organizationId !== organizationId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return { hostId: host.hostId };
  }
}
