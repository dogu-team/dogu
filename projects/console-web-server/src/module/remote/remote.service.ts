import { ProjectPropCamel, RemoteBase, RemoteDeviceJobPropCamel, RemoteDeviceJobPropSnake, RemotePropCamel } from '@dogu-private/console';
import { OrganizationId, ProjectId, RemoteDeviceJobId, RemoteId } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RemoteDeviceJob } from '../../db/entity/remote-device-job.entity';
import { Remote } from '../../db/entity/remote.entity';
import { env } from '../../env';

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
      relations: [RemotePropCamel.remoteDeviceJobs, `${RemotePropCamel.remoteDeviceJobs}.${RemoteDeviceJobPropCamel.device}`],
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

  async getResultUrl(remoteDeviceJobId: RemoteDeviceJobId): Promise<string> {
    const remoteDeviceJob = await this.dataSource //
      .getRepository(RemoteDeviceJob)
      .createQueryBuilder('remoteDeviceJob')
      .innerJoinAndSelect(`remoteDeviceJob.${RemoteDeviceJobPropCamel.remote}`, 'remote')
      .innerJoinAndSelect(`remote.${RemotePropCamel.project}`, 'project')
      .innerJoinAndSelect(`project.${ProjectPropCamel.organization}`, 'organization')
      .where(`remoteDeviceJob.${RemoteDeviceJobPropSnake.remote_device_job_id} = :${RemoteDeviceJobPropCamel.remoteDeviceJobId}`, { remoteDeviceJobId })
      .getOne();

    if (!remoteDeviceJob) {
      throw new HttpException(`RemoteDeviceJob with id ${remoteDeviceJobId} not found`, HttpStatus.NOT_FOUND);
    }
    const project = remoteDeviceJob!.remote!.project;
    const projectId = project!.projectId;
    const organizationId = project!.organization.organizationId;
    const resultUrl = `${env.DOGU_CONSOLE_URL}/dashboard/${organizationId}/projects/${projectId}/remotes/${remoteDeviceJob.remoteId}`;
    return resultUrl;
  }
}
