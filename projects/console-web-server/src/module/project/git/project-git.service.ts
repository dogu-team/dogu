import { OrganizationId, ProjectId, REPOSITORY_TYPE } from '@dogu-private/types';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { GithubRepositoryAuth } from '../../../db/entity/github-repository-auth.entity';
import { GitlabRepositoryAuth } from '../../../db/entity/gitlab-repository-auth.entity';
import { ProjectRepository } from '../../../db/entity/project-repository';
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
    const { service, token, url } = updateProjectGitDto;
    const encryptedToken = await bcrypt.hash(token, 10);

    return await this.dataSource.transaction(async (manager) => {
      const existingProjectRepository = await manager.getRepository(ProjectRepository).findOne({ where: { projectId } });

      if (existingProjectRepository) {
        // clear existing auth
        await manager.softDelete(ProjectRepository, { projectId });
        switch (existingProjectRepository.repositoryType) {
          case REPOSITORY_TYPE.GITHUB:
            await manager.softDelete(GithubRepositoryAuth, { projectRepositoryId: existingProjectRepository.projectRepositoryId });
            break;
          case REPOSITORY_TYPE.GITLAB:
            await manager.softDelete(GitlabRepositoryAuth, { projectRepositoryId: existingProjectRepository.projectRepositoryId });
            break;
        }
      }

      const newProjectRepository = manager.getRepository(ProjectRepository).create({
        projectRepositoryId: v4(),
        projectId,
        repositoryType: service,
        url,
      });
      const rv = await manager.getRepository(ProjectRepository).save(newProjectRepository);

      switch (service) {
        case REPOSITORY_TYPE.GITHUB:
          const newGithubRepositoryAuth = manager.getRepository(GithubRepositoryAuth).create({
            githubRepositoryAuthId: v4(),
            token: encryptedToken,
            projectRepositoryId: rv.projectRepositoryId,
          });
          await manager.getRepository(GithubRepositoryAuth).save(newGithubRepositoryAuth);
          return;
        case REPOSITORY_TYPE.GITLAB:
          const newGitlabRepositoryAuth = manager.getRepository(GitlabRepositoryAuth).create({
            gitlabRepositoryAuthId: v4(),
            token: encryptedToken,
            projectRepositoryId: rv.projectRepositoryId,
          });
          await manager.getRepository(GitlabRepositoryAuth).save(newGitlabRepositoryAuth);
          return;
        default:
          throw new BadRequestException('Invalid repository type');
      }
    });
  }
}
