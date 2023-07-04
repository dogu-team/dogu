import { ProjectGitlabPropCamel } from '@dogu-private/console';
import { OrganizationId, ProjectId, REPOSITORY_TYPE } from '@dogu-private/types';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { GithubRepositoryAuth } from '../../../db/entity/github-repository-auth.entity';
import { ProjectRepository } from '../../../db/entity/project-repository';
import { castEntity } from '../../../types/entity-cast';
import { UpdateProjectGitDto } from './dto/project-git.dto';

@Injectable()
export class ProjectGitService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getProjectGit(organizationId: OrganizationId, projectId: ProjectId) {
    const projectRepository = await this.dataSource.getRepository(ProjectRepository).findOne({
      where: { projectId },
    });

    if (!projectRepository) {
      throw new NotFoundException('Project repository not configured');
    }

    return projectRepository;
  }

  async updateProjectGit(organizationId: OrganizationId, projectId: ProjectId, updateProjectGitDto: UpdateProjectGitDto) {
    const { service, token, repoUrl, configUrl } = updateProjectGitDto;

    return await this.dataSource.transaction(async (manager) => {
      const newProjectRepository = manager.getRepository(ProjectRepository).create({
        projectId,
        repositoryType: service,
        repositoryUrl: repoUrl,
        configFilePath: configUrl,
      });
      const rv = await manager.getRepository(ProjectRepository).upsert(castEntity(newProjectRepository), [ProjectGitlabPropCamel.projectId]);

      switch (service) {
        case REPOSITORY_TYPE.GITHUB:
          const newGithubRepositoryAuth = manager.getRepository(GithubRepositoryAuth).create({
            token,
          });
          return;
        case REPOSITORY_TYPE.GITLAB:
          const newGitlabRepositoryAuth = manager.getRepository(GithubRepositoryAuth).create({
            token,
          });
          return;
        default:
          throw new BadRequestException('Invalid repository type');
      }
    });
  }
}
