import { UpdateProjectSlackRemoteDtoBase, UpdateProjectSlackRoutineDtoBase } from '@dogu-private/console';
import { ProjectId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ProjectSlackRemote } from '../../../../db/entity/project-slack-remote.entity';
import { ProjectSlackRoutine } from '../../../../db/entity/project-slack-routine.entity';

@Injectable()
export class ProjectSlackService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getProjectSlackRemote(projectId: ProjectId) {
    return await this.dataSource.getRepository(ProjectSlackRemote).findOne({
      where: {
        projectId,
      },
    });
  }

  async getProjectSlackRoutine(projectId: ProjectId, routineId: string) {
    return await this.dataSource.getRepository(ProjectSlackRoutine).findOne({
      where: {
        projectId,
        routineId,
      },
    });
  }

  async updateProjectSlackRemote(projectId: ProjectId, dto: UpdateProjectSlackRemoteDtoBase) {
    const projectSlackRemote = this.dataSource.getRepository(ProjectSlackRemote).create({
      projectId,
      channelId: dto.channelId,
      onSuccess: dto.onSuccess,
      onFailure: dto.onFailure,
    });

    await this.dataSource.getRepository(ProjectSlackRemote).save(projectSlackRemote);
  }

  async updateProjectSlackRoutine(projectId: ProjectId, dto: UpdateProjectSlackRoutineDtoBase) {
    const projectSlackRoutine = this.dataSource.getRepository(ProjectSlackRoutine).create({
      projectId,
      routineId: dto.routineId,
      channelId: dto.channelId,
      onSuccess: dto.onSuccess,
      onFailure: dto.onFailure,
    });

    await this.dataSource.getRepository(ProjectSlackRoutine).save(projectSlackRoutine);
  }
}
