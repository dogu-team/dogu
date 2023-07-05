import { OrganizationId, ProjectId, REPOSITORY_TYPE } from '@dogu-private/types';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import crypto from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { GithubRepositoryAuth } from '../../../db/entity/github-repository-auth.entity';
import { GitlabRepositoryAuth } from '../../../db/entity/gitlab-repository-auth.entity';
import { OrganizationKey } from '../../../db/entity/index';
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

    return await this.dataSource.transaction(async (manager) => {
      const existingProjectRepository = await manager.getRepository(ProjectRepository).findOne({ where: { projectId } });
      const encryptedToken = await this.encryptToken(manager, organizationId, token);

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

  async findTestScripts(organizationId: OrganizationId, projectId: ProjectId) {
    const projectRepository = await this.dataSource.getRepository(ProjectRepository).findOne({
      where: { projectId },
    });

    if (!projectRepository) {
      throw new NotFoundException('Project repository not configured');
    }

    switch (projectRepository.repositoryType) {
      case REPOSITORY_TYPE.GITHUB:
        const githubRepositoryAuth = await this.dataSource.getRepository(GithubRepositoryAuth).findOne({
          where: { projectRepositoryId: projectRepository.projectRepositoryId },
        });

        if (!githubRepositoryAuth || githubRepositoryAuth.token === null) {
          throw new NotFoundException('Github repository auth not configured');
        }

        const githubToken = await this.decryptToken(this.dataSource.manager, organizationId, githubRepositoryAuth.token);

        // TODO: implement
        return;
      case REPOSITORY_TYPE.GITLAB:
        const gitlabRepositoryAuth = await this.dataSource.getRepository(GitlabRepositoryAuth).findOne({
          where: { projectRepositoryId: projectRepository.projectRepositoryId },
        });

        if (!gitlabRepositoryAuth || gitlabRepositoryAuth.token === null) {
          throw new NotFoundException('Gitlab repository auth not configured');
        }

        const gitlabToken = await this.decryptToken(this.dataSource.manager, organizationId, gitlabRepositoryAuth.token);

        // TODO: implement
        return;
      default:
        throw new BadRequestException('Invalid repository type');
    }
  }

  private async encryptToken(transactionManager: EntityManager, organizationId: OrganizationId, rawToken: string) {
    const organizationKey = await transactionManager.getRepository(OrganizationKey).findOne({
      where: { organizationId },
    });

    if (!organizationKey) {
      throw new NotFoundException('Organization key not found');
    }

    const key = organizationKey.key;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(rawToken), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private async decryptToken(transactionManager: EntityManager, organizationId: OrganizationId, encryptedToken: string) {
    const organizationKey = await transactionManager.getRepository(OrganizationKey).findOne({
      where: { organizationId },
    });

    if (!organizationKey) {
      throw new NotFoundException('Organization key not found');
    }

    const key = organizationKey.key;

    const [iv, encrypted] = encryptedToken.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]);
    return decrypted.toString();
  }
}
