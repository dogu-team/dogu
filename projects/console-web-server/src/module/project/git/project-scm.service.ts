import { DoguScmConfig, OrganizationId, ProjectId, ProjectTestScript, PROJECT_SCM_TYPE } from '@dogu-private/types';
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import crypto from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { OrganizationKey } from '../../../db/entity/index';
import { ProjectScm } from '../../../db/entity/project-scm';
import { ProjectScmGithubAuth } from '../../../db/entity/project-scm-github-auth.entity';
import { ProjectScmGitlabAuth } from '../../../db/entity/project-scm-gitlab-auth.entity';
import { Github } from '../../../sdk/github';
import { Gitlab } from '../../../sdk/gitlab';
import { UpdateProjectGitDto } from './dto/project-scm.dto';

@Injectable()
export class ProjectScmService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getProjectGit(organizationId: OrganizationId, projectId: ProjectId) {
    const projectScm = await this.dataSource.getRepository(ProjectScm).findOne({
      where: { projectId },
    });

    if (!projectScm) {
      throw new NotFoundException('Project repository not configured');
    }

    return projectScm;
  }

  async updateProjectGit(organizationId: OrganizationId, projectId: ProjectId, updateProjectGitDto: UpdateProjectGitDto) {
    const { service, token, url } = updateProjectGitDto;

    return await this.dataSource.transaction(async (manager) => {
      const existingProjectScm = await manager.getRepository(ProjectScm).findOne({ where: { projectId } });
      const encryptedToken = await this.encryptToken(manager, organizationId, token);

      if (existingProjectScm) {
        // clear existing auth
        await manager.softDelete(ProjectScm, { projectId });
        switch (existingProjectScm.type) {
          case PROJECT_SCM_TYPE.GITHUB:
            await manager.softDelete(ProjectScmGithubAuth, { projectScmId: existingProjectScm.projectScmId });
            break;
          case PROJECT_SCM_TYPE.GITLAB:
            await manager.softDelete(ProjectScmGitlabAuth, { projectScmId: existingProjectScm.projectScmId });
            break;
        }
      }

      const newProjectScm = manager.getRepository(ProjectScm).create({
        projectScmId: v4(),
        projectId,
        type: service,
        url,
      });
      const rv = await manager.getRepository(ProjectScm).save(newProjectScm);

      switch (service) {
        case PROJECT_SCM_TYPE.GITHUB:
          const newProjectScmGithubAuth = manager.getRepository(ProjectScmGithubAuth).create({
            projectScmGithubAuthId: v4(),
            token: encryptedToken,
            projectScmId: rv.projectScmId,
          });
          await manager.getRepository(ProjectScmGithubAuth).save(newProjectScmGithubAuth);
          return;
        case PROJECT_SCM_TYPE.GITLAB:
          const newProjectScmGitlabAuth = manager.getRepository(ProjectScmGitlabAuth).create({
            projectScmGitlabAuthId: v4(),
            token: encryptedToken,
            projectScmId: rv.projectScmId,
          });
          await manager.getRepository(ProjectScmGitlabAuth).save(newProjectScmGitlabAuth);
          return;
        default:
          throw new BadRequestException('Invalid repository type');
      }
    });
  }

  async findTestScripts(organizationId: OrganizationId, projectId: ProjectId): Promise<ProjectTestScript[]> {
    const projectScm = await this.dataSource.getRepository(ProjectScm).findOne({
      where: { projectId },
    });

    if (!projectScm) {
      throw new NotFoundException('Project repository not configured');
    }

    switch (projectScm.type) {
      case PROJECT_SCM_TYPE.GITHUB: {
        const projectScmGithubAuth = await this.dataSource.getRepository(ProjectScmGithubAuth).findOne({
          where: { projectScmId: projectScm.projectScmId },
        });

        if (!projectScmGithubAuth) {
          throw new NotFoundException('Github repository auth not configured');
        }

        const githubToken = await this.decryptToken(this.dataSource.manager, organizationId, projectScmGithubAuth.token);
        const url = new URL(projectScm.url);
        const parts: string[] = url.pathname.split('/');
        const org: string = parts[1];
        const repo: string = parts[2];

        const content = await Github.readDoguConfigFile(githubToken, org, repo);
        const json: DoguScmConfig = JSON.parse(content.replaceAll('\n| ', ''));
        const result = await Github.getScriptFiles(githubToken, org, repo, json.scriptFolderPaths);

        return result.map((r) => ({
          name: r.path?.split('/').pop() ?? '',
          path: r.path ?? '',
          size: r.size ?? 0,
          type: r.type ?? '',
        }));
      }
      case PROJECT_SCM_TYPE.GITLAB: {
        const projectScmGitlabbAuth = await this.dataSource.getRepository(ProjectScmGitlabAuth).findOne({
          where: { projectScmId: projectScm.projectScmId },
        });

        if (!projectScmGitlabbAuth) {
          throw new NotFoundException('Gitlab repository auth not configured');
        }

        const gitlabToken = await this.decryptToken(this.dataSource.manager, organizationId, projectScmGitlabbAuth.token);
        const url = new URL(projectScm.url);
        const parts: string[] = url.pathname.split('/');
        const org: string = parts[1];
        const repo: string = parts[2];
        const hostUrl = url.origin;

        const json = await Gitlab.readDoguConfigFile(hostUrl, gitlabToken, repo);
        const metaTrees = await Promise.all(
          json.scriptFolderPaths.map(async (path) => {
            return Gitlab.getProjectFileMetaTree(hostUrl, gitlabToken, repo, path);
          }),
        );

        const results: ProjectTestScript[] = metaTrees
          .flat()
          .filter((meta) => meta.type === 'blob')
          .map((meta) => {
            const rv: ProjectTestScript = {
              name: meta.name,
              path: meta.path,
              size: Number(meta.size),
              type: meta.type,
            };
            return rv;
          });

        return results;
      }
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

  async getGitUrlWithAuth(organizationId: OrganizationId, projectId: ProjectId) {
    const scm = await this.dataSource.getRepository(ProjectScm).findOne({ where: { projectId } });
    if (!scm) {
      throw new HttpException(`This Project does not have scm: ${projectId}`, HttpStatus.NOT_FOUND);
    }
    const url = new URL(scm.url);
    let token = '';
    const host = url.host;
    const protocol = url.protocol;
    const parts: string[] = url.pathname.split('/');
    const org: string = parts[1];
    const repo: string = parts[2];

    switch (scm.type) {
      case PROJECT_SCM_TYPE.GITLAB:
        {
          const gitlabAuth = await this.dataSource.getRepository(ProjectScmGitlabAuth).findOne({ where: { projectScmId: scm.projectScmId } });
          if (!gitlabAuth) {
            throw new HttpException(`This Project does not have gitlab auth: ${projectId}`, HttpStatus.NOT_FOUND);
          }
          token = await this.decryptToken(this.dataSource.manager, organizationId, gitlabAuth.token);
        }
        break;
      case PROJECT_SCM_TYPE.GITHUB:
        {
          const githubAuth = await this.dataSource.getRepository(ProjectScmGithubAuth).findOne({ where: { projectScmId: scm.projectScmId } });
          if (!githubAuth) {
            throw new HttpException(`This Project does not have github auth: ${projectId}`, HttpStatus.NOT_FOUND);
          }
          token = token = await this.decryptToken(this.dataSource.manager, organizationId, githubAuth.token);
        }
        break;
      default:
        throw new HttpException(`This Project does not have scm: ${projectId}`, HttpStatus.NOT_FOUND);
    }

    const gitUrlWithAuth = `${protocol}//oauth2:${token}@${host}/${org}/${repo}.git`;

    return gitUrlWithAuth;
  }
}
