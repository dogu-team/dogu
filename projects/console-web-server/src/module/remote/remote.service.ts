import { RemoteBase, RemoteDeviceJobPropCamel, RemotePropCamel } from '@dogu-private/console';
import { OrganizationId, ProjectId, RemoteId } from '@dogu-private/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Remote } from '../../db/entity/remote.entity';

import { Page } from '../common/dto/pagination/page';
import { FindAllRemoteDto } from './dto/remote.dto';

@Injectable()
export class RemoteService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAllRemotes(organizationId: OrganizationId, projectId: ProjectId, dto: FindAllRemoteDto): Promise<Page<RemoteBase>> {
    const [remotes, count] = await this.dataSource.getRepository(Remote).findAndCount({
      where: {
        projectId,
      },
      order: {
        createdAt: 'DESC',
      },
      relations: [RemotePropCamel.remoteDeviceJobs],
      take: dto.getDBLimit(),
      skip: dto.getDBOffset(),
    });

    return new Page(dto.page, dto.offset, count, remotes);
  }

  async findRemoteById(organizationId: OrganizationId, projectId: ProjectId, remoteId: RemoteId): Promise<RemoteBase> {
    const rv = await this.dataSource.getRepository(Remote).findOne({
      where: {
        projectId,
        remoteId,
      },
      relations: [RemotePropCamel.remoteDeviceJobs, `${RemotePropCamel.remoteDeviceJobs}.${RemoteDeviceJobPropCamel.device}`],
    });

    if (!rv) throw new NotFoundException(`Remote with id ${remoteId} not found`);

    return rv;
  }
}
