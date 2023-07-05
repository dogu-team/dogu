import {
  ProjectAndTeamAndProjectRolePropCamel,
  ProjectAndUserAndProjectRolePropCamel,
  ProjectAndUserAndProjectRolePropSnake,
  TeamPropCamel,
  // UserGitlabPropSnake,
  UserPropCamel,
  UserPropSnake,
} from '@dogu-private/console';
import { OrganizationId, ProjectId, ProjectRoleId, TeamId, UserId } from '@dogu-private/types';
import { delay } from '@dogu-tech/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import axios from 'axios';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '../../db/entity/index';
import { ProjectScm } from '../../db/entity/project-scm';

// import { OrganizationGitlab } from '../../db/entity/organization-gitlab.entity';
// import { ProjectGitlab } from '../../db/entity/project-gitlab.entity';
// import { UserGitlab } from '../../db/entity/user-gitlab.entity';
import { Gitlab } from '../../sdk/gitlab';
import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { DoguLogger } from '../logger/logger';

@Injectable()
export class GitlabService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  private async healthCheck(url: string) {
    const gitLabUrl = url;
    const readinessUrl = `${gitLabUrl}/-/readiness?all=1`;
    const livenessUrl = `${gitLabUrl}/-/liveness`;
    const healthUrl = `${gitLabUrl}/-/health`;

    let gitLabIsReady = false;

    this.logger.info('healthCheck. Start GitLab health check...');
    while (!gitLabIsReady) {
      try {
        this.logger.info('healthCheck. Checking GitLab health check...');
        this.logger.info(`healthCheck. gitLabUrl: ${gitLabUrl}`);
        const responses = await Promise.all([axios.get(readinessUrl), axios.get(livenessUrl), axios.get(healthUrl)]);

        gitLabIsReady = responses.every((response) => {
          return response.status === 200;
        });

        if (!gitLabIsReady) {
          this.logger.info('healthCheck. GitLab is not ready, retrying in 10 seconds...');

          // test code
          const test = responses.some((response) => {
            return response.status === 200;
          });
          if (test) {
            this.logger.debug(JSON.stringify(responses));
          }

          await delay(10000);
        } else {
          this.logger.info('healthCheck. GitLab is ready!');
        }
      } catch (error) {
        // this.logger.info(stringifyError(error));
        this.logger.info('healthCheck. GitLab is not ready, retrying in 10 seconds...');
        await delay(10000);
      }
    }
  }

  private convertOrganizationRoleIdToGitlabAccessLevel(organizationRoleId: ORGANIZATION_ROLE) {
    switch (organizationRoleId) {
      case ORGANIZATION_ROLE.OWNER:
      case ORGANIZATION_ROLE.ADMIN:
        return Gitlab.AccessLevel.Maintainer;
      case ORGANIZATION_ROLE.MEMBER:
        return Gitlab.AccessLevel.Guest;
      default:
        return Gitlab.AccessLevel.Guest;
    }
  }

  private convertProjectRoleToGitlabAccessLevel(projectRoleId: ProjectRoleId) {
    let accessLevel: Gitlab.AccessLevel;
    switch (projectRoleId) {
      case 1:
      case 2:
        accessLevel = Gitlab.AccessLevel.Maintainer;
        break;
      case 3:
        accessLevel = Gitlab.AccessLevel.Reporter;
        break;
      default:
        accessLevel = Gitlab.AccessLevel.Guest;
    }

    return accessLevel;
  }

  private async getUserProjectRoleState(manager: EntityManager, userId: UserId, projectId: ProjectId) {
    const user = await manager
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        `user.${UserPropCamel.projectAndUserAndProjectRoles}`,
        'projectUserRole',
        `projectUserRole.${ProjectAndUserAndProjectRolePropSnake.project_id} = :${ProjectAndUserAndProjectRolePropCamel.projectId}`,
        { projectId },
      )
      .leftJoinAndSelect(`projectUserRole.${ProjectAndUserAndProjectRolePropCamel.projectRole}`, 'userRole')
      .leftJoinAndSelect(`user.${UserPropCamel.teams}`, 'team')
      .leftJoinAndSelect(`team.${TeamPropCamel.projectAndTeamAndProjectRoles}`, 'projectTeamRole')
      .leftJoinAndSelect(`projectTeamRole.${ProjectAndTeamAndProjectRolePropCamel.projectRole}`, 'teamRole')
      .where(`user.${UserPropSnake.user_id} = :${UserPropCamel.userId}`, { userId })
      .getOne();

    if (!user) {
      throw new HttpException(`User is not found: ${userId}`, HttpStatus.NOT_FOUND);
    }

    //@ts-ignore
    const userProjectRole = user.projectAndUserAndProjectRoles?.length !== 0 ? user.projectAndUserAndProjectRoles[0].projectRoleId : undefined;
    const projectTeamRoles: { teamId: TeamId; projectRoleId: ProjectRoleId }[] = [];
    if (user.teams) {
      for (const team of user.teams) {
        if (!team.projectAndTeamAndProjectRoles) {
          continue;
        }

        for (const projectTeamRole of team.projectAndTeamAndProjectRoles) {
          if (projectTeamRole.projectId === projectId) {
            projectTeamRoles.push({
              teamId: team.teamId,
              projectRoleId: projectTeamRole.projectRoleId,
            });
          }
        }
      }
    }

    const userProjectMaxRoleIdInTeam = projectTeamRoles.length === 0 ? undefined : Math.max(...projectTeamRoles.map((projectTeamRole) => projectTeamRole.projectRoleId));

    const projectRoles: {
      projectRoleId: ProjectRoleId | undefined;
      projectMaxRoleIdInTeam: ProjectRoleId | undefined;
      projectTeamRoles: { teamId: TeamId; projectRoleId: ProjectRoleId }[];
    } = {
      projectRoleId: userProjectRole,
      projectMaxRoleIdInTeam: userProjectMaxRoleIdInTeam,
      projectTeamRoles: projectTeamRoles,
    };

    return projectRoles;
  }

  async getGitUrlWithAuth(organizationId: OrganizationId, projectId: ProjectId) {
    // const projectGitlab = await this.dataSource.getRepository(ProjectGitlab).findOne({ where: { projectId } });
    // if (!projectGitlab) {
    //   throw new HttpException(`Project is not in gitlab: ${projectId}`, HttpStatus.NOT_FOUND);
    // }

    const repository = await this.dataSource.getRepository(ProjectScm).findOne({ where: { projectId } });

    const gitUrlWithoutProtocol = 'urlWithoutProtocol';
    // const gitUrlWithAuth = `https://oauth2:${projectGitlab.gitlabProjectToken}@${gitUrlWithoutProtocol}/${organizationId}/${projectId}.git`;
    const gitUrlWithAuth = '';

    return gitUrlWithAuth;
  }

  async resetPassword(manager: EntityManager, userId: UserId, password: string) {
    throw new Error('Not implemented');
    // const [userGitlab] = await Promise.all([manager.getRepository(UserGitlab).findOne({ where: { userId } })]);

    // if (!userGitlab) {
    //   throw new HttpException(`User is not in gitlab: ${userId}`, HttpStatus.NOT_FOUND);
    // }

    // await Gitlab.resetPassword(userGitlab, password);
  }

  // async createUser(userId: UserId, name: string, email: string, password: string | null) {
  //   const user = await Gitlab.createUser(userId, name, email, password);
  //   return user;
  // }

  // async createGroup(manager: EntityManager, userId: UserId, organizationId: OrganizationId, organizationName: string) {
  //   const [userGitlab] = await Promise.all([manager.getRepository(UserGitlab).findOne({ where: { userId } })]);

  //   if (!userGitlab) {
  //     throw new HttpException(`User is not in gitlab: ${userId}`, HttpStatus.NOT_FOUND);
  //   }

  //   const gitlabGroup = await Gitlab.createGroup(userGitlab, organizationId);
  //   const gitlabData = manager.getRepository(OrganizationGitlab).create({
  //     organizationId,
  //     gitlabGroupId: gitlabGroup.groupId,
  //     gitlabGroupToken: gitlabGroup.groupToken,
  //   });

  //   const organizationGitlab = await manager.getRepository(OrganizationGitlab).save(gitlabData);
  //   await Gitlab.updateGroup(organizationGitlab, organizationName);
  // }

  // async updateGroup(manager: EntityManager, organizationId: OrganizationId, organizationName: string) {
  //   const organizationGitlab = await manager.getRepository(OrganizationGitlab).findOne({ where: { organizationId } });
  //   if (!organizationGitlab) {
  //     throw new HttpException(`Organization is not in gitlab: ${organizationId}`, HttpStatus.NOT_FOUND);
  //   }

  //   await Gitlab.updateGroup(organizationGitlab, organizationName);
  // }

  // async deleteGroup(manager: EntityManager, organizationId: OrganizationId) {
  //   const organizationGitlab = await manager.getRepository(OrganizationGitlab).findOne({ where: { organizationId } });
  //   if (!organizationGitlab) {
  //     throw new HttpException(`Organization is not in gitlab: ${organizationId}`, HttpStatus.NOT_FOUND);
  //   }

  //   await Gitlab.deleteGroup(organizationGitlab);
  // }

  // async createProject(manager: EntityManager, organizationId: OrganizationId, projectId: ProjectId, projectName: string, projectDescription: string, option: { language: string }) {
  //   const organizationGitlab = await manager.getRepository(OrganizationGitlab).findOne({ where: { organizationId } });
  //   if (!organizationGitlab) {
  //     throw new HttpException(`Organization is not in gitlab: ${organizationId}`, HttpStatus.NOT_FOUND);
  //   }

  //   // const gitlabProject = await Gitlab.createProject(organizationGitlab, projectId, projectName, projectDescription, option);
  //   const gitlabProjectData = manager.getRepository(ProjectGitlab).create({
  //     gitlabGroupId: organizationGitlab.gitlabGroupId,
  //     projectId: projectId,
  //     gitlabProjectId: gitlabProject.projectId,
  //     gitlabProjectToken: gitlabProject.projectToken,
  //   });
  //   await manager.getRepository(ProjectGitlab).save(gitlabProjectData);

  //   await Gitlab.updateProject(organizationGitlab, gitlabProject.projectId, projectName, projectDescription);
  // }

  // async deleteProject(manager: EntityManager, organizationId: OrganizationId, projectId: ProjectId) {
  //   const [organizationGitlab, projectGitlab] = await Promise.all([
  //     manager.getRepository(OrganizationGitlab).findOne({ where: { organizationId } }),
  //     manager.getRepository(ProjectGitlab).findOne({ where: { projectId } }),
  //   ]);

  //   if (!organizationGitlab) {
  //     throw new HttpException(`Organization is not in gitlab: ${organizationId}`, HttpStatus.NOT_FOUND);
  //   }
  //   if (!projectGitlab) {
  //     throw new HttpException(`Project is not in gitlab: ${projectId}`, HttpStatus.NOT_FOUND);
  //   }

  //   await Gitlab.deleteProject(organizationGitlab, projectGitlab);
  // }

  // async updateProject(manager: EntityManager, organizationId: OrganizationId, projectId: ProjectId, projectName: string, description: string) {
  //   const [organizationGitlab, projectGitlab] = await Promise.all([
  //     manager.getRepository(OrganizationGitlab).findOne({ where: { organizationId } }),
  //     manager.getRepository(ProjectGitlab).findOne({ where: { projectId } }),
  //   ]);

  //   if (!organizationGitlab) {
  //     throw new HttpException(`Organization is not in gitlab: ${organizationId}`, HttpStatus.NOT_FOUND);
  //   }
  //   if (!projectGitlab) {
  //     throw new HttpException(`Project is not in gitlab: ${projectId}`, HttpStatus.NOT_FOUND);
  //   }

  //   await Gitlab.updateProject(organizationGitlab, projectGitlab.gitlabProjectId, projectName, description);
  // }

  // async addUserToTeam(manager: EntityManager, organizationId: OrganizationId, teamId: number, userId: UserId) {
  //   const organizationUser = await manager.getRepository(OrganizationAndUserAndOrganizationRole).findOne({ where: { organizationId, userId: userId } });
  //   if (!organizationUser) {
  //     throw new HttpException(`User is not in organization: ${userId}`, HttpStatus.NOT_FOUND);
  //   }

  //   const accessLevel = this.convertOrganizationRoleIdToGitlabAccessLevel(organizationUser.organizationRoleId);
  //   const isAdmin = accessLevel === Gitlab.AccessLevel.Maintainer;
  //   if (isAdmin) {
  //     return;
  //   }

  //   const projectUserRole = await manager.getRepository(ProjectAndTeamAndProjectRole).find({ where: { teamId } });
  //   const adds: Promise<void>[] = [];
  //   for (const teamAndRoleGroup of projectUserRole) {
  //     adds.push(this.addUserToProject(manager, userId, teamAndRoleGroup.projectId, teamAndRoleGroup.projectRoleId));
  //   }

  //   await Promise.all(adds);
  // }

  // async removeUserFromTeam(manager: EntityManager, organizationId: OrganizationId, teamId: number, userId: UserId) {
  //   const organizationUser = await manager.getRepository(OrganizationAndUserAndOrganizationRole).findOne({ where: { organizationId, userId: userId } });
  //   if (!organizationUser) {
  //     throw new HttpException(`User is not in organization: ${userId}`, HttpStatus.NOT_FOUND);
  //   }

  //   const accessLevel = this.convertOrganizationRoleIdToGitlabAccessLevel(organizationUser.organizationRoleId);
  //   const isAdmin = accessLevel === Gitlab.AccessLevel.Maintainer;
  //   if (isAdmin) {
  //     return;
  //   }

  //   const projectTeamRole = await manager.getRepository(ProjectAndTeamAndProjectRole).find({ where: { teamId } });
  //   const removes: Promise<void>[] = [];
  //   for (const teamAndRoleGroup of projectTeamRole) {
  //     removes.push(this.removeUserFromProject(manager, userId, teamAndRoleGroup.projectId));
  //   }

  //   await Promise.all(removes);
  // }

  // async addTeamToProject(manager: EntityManager, organizationId: OrganizationId, projectId: ProjectId, teamId: number, teamRoleGroupId: number) {
  //   const users = await manager.getRepository(OrganizationAndUserAndTeam).find({ where: { teamId: teamId } });
  //   const adds: Promise<void>[] = [];
  //   for (const user of users) {
  //     const organizationUser = await manager.getRepository(OrganizationAndUserAndOrganizationRole).findOne({ where: { organizationId, userId: user.userId } });
  //     if (!organizationUser) {
  //       throw new Error(`OrganizationAndUserAndOrganizationRole not found. organizationId: ${organizationId}, userId: ${user.userId}`);
  //     }

  //     const accessLevel = this.convertOrganizationRoleIdToGitlabAccessLevel(organizationUser.organizationRoleId);
  //     const isAdmin = accessLevel === Gitlab.AccessLevel.Maintainer;
  //     if (isAdmin) {
  //       continue;
  //     }

  //     adds.push(this.addUserToProject(manager, user.userId, projectId, teamRoleGroupId));
  //   }

  //   await Promise.all(adds);
  // }

  // async removeTeamFromProject(manager: EntityManager, organizationId: OrganizationId, projectId: ProjectId, teamId: TeamId) {
  //   const users = await manager.getRepository(OrganizationAndUserAndTeam).find({ where: { teamId: teamId } });

  //   const removes: Promise<void>[] = [];
  //   for (const user of users) {
  //     const organizationUser = await manager.getRepository(OrganizationAndUserAndOrganizationRole).findOne({ where: { organizationId, userId: user.userId } });
  //     if (!organizationUser) {
  //       throw new Error(`OrganizationAndUserAndOrganizationRole not found. organizationId: ${organizationId}, userId: ${user.userId}`);
  //     }

  //     const accessLevel = this.convertOrganizationRoleIdToGitlabAccessLevel(organizationUser.organizationRoleId);
  //     const isAdmin = accessLevel === Gitlab.AccessLevel.Maintainer;
  //     if (isAdmin) {
  //       continue;
  //     }

  //     removes.push(this.removeUserFromProject(manager, user.userId, projectId));
  //   }

  //   await Promise.all(removes);
  // }

  // async updateTeamRoleToGroup(manager: EntityManager, projectId: ProjectId, teamId: TeamId, projectRoleId: ProjectRoleId) {
  //   const [projectGitlab, users] = await Promise.all([
  //     manager.getRepository(ProjectGitlab).findOne({ where: { projectId } }),
  //     manager.getRepository(OrganizationAndUserAndTeam).find({ where: { teamId } }),
  //   ]);

  //   if (projectGitlab === null) {
  //     throw new Error(`ProjectGitlab not found. projectId: ${projectId}`);
  //   }

  //   const userGitlabs = await manager
  //     .getRepository(UserGitlab)
  //     .createQueryBuilder()
  //     .where(`${UserGitlabPropSnake.user_id} IN (:...userIds)`, { userIds: users.map((user) => user.userId) })
  //     .getMany();
  //   const updates: Promise<void>[] = [];
  //   for (const userGitlab of userGitlabs) {
  //     const userProjectRoleState = await this.getUserProjectRoleState(manager, userGitlab.userId, projectId);

  //     let selectedProjectTeamRole;
  //     for (const projectTeamRole of userProjectRoleState.projectTeamRoles) {
  //       if (projectTeamRole.teamId === teamId) {
  //         selectedProjectTeamRole = projectTeamRole;
  //         break;
  //       }
  //     }

  //     if (!selectedProjectTeamRole) {
  //       if (userProjectRoleState.projectMaxRoleIdInTeam) {
  //         if (userProjectRoleState.projectMaxRoleIdInTeam < projectRoleId) {
  //           updates.push(this.updateUserProjectRole(manager, userGitlab.userId, projectId, projectRoleId));
  //           continue;
  //         }
  //       } else {
  //         if (userProjectRoleState.projectRoleId) {
  //           if (userProjectRoleState.projectRoleId < projectRoleId) {
  //             updates.push(this.updateUserProjectRole(manager, userGitlab.userId, projectId, projectRoleId));
  //             continue;
  //           }
  //         }
  //       }
  //     } else {
  //       if (userProjectRoleState.projectMaxRoleIdInTeam) {
  //         if (userProjectRoleState.projectMaxRoleIdInTeam < projectRoleId) {
  //           updates.push(this.updateUserProjectRole(manager, userGitlab.userId, projectId, projectRoleId));
  //           continue;
  //         }
  //       } else {
  //         if (userProjectRoleState.projectRoleId) {
  //           if (userProjectRoleState.projectRoleId < projectRoleId) {
  //             updates.push(this.updateUserProjectRole(manager, userGitlab.userId, projectId, projectRoleId));
  //             continue;
  //           }
  //         }
  //       }
  //     }
  //   }

  //   await Promise.all(updates);
  // }

  // async addUserToGroup(manager: EntityManager, userId: UserId, organizationId: OrganizationId, organizationRoleId: ORGANIZATION_ROLE) {
  //   const [userGitlab, groupGitlab] = await Promise.all([
  //     manager.getRepository(UserGitlab).findOne({
  //       where: {
  //         userId,
  //       },
  //     }),
  //     manager.getRepository(OrganizationGitlab).findOne({
  //       where: {
  //         organizationId,
  //       },
  //     }),
  //   ]);

  //   if (userGitlab === null) {
  //     throw new Error('gitlab of user not found');
  //   }
  //   if (groupGitlab === null) {
  //     throw new Error('gitlab of group not found');
  //   }

  //   const accessLevel = this.convertOrganizationRoleIdToGitlabAccessLevel(organizationRoleId);
  //   await Gitlab.addUserToGroup(userGitlab, groupGitlab, accessLevel);
  // }

  // async removeUserFromGroup(manager: EntityManager, userId: UserId, organizationId: OrganizationId) {
  //   const [userGitlab, groupGitlab] = await Promise.all([
  //     manager.getRepository(UserGitlab).findOne({
  //       where: {
  //         userId,
  //       },
  //     }),
  //     manager.getRepository(OrganizationGitlab).findOne({
  //       where: {
  //         organizationId,
  //       },
  //     }),
  //   ]);

  //   if (userGitlab === null) {
  //     throw new Error('gitlab of user not found');
  //   }
  //   if (groupGitlab === null) {
  //     throw new Error('gitlab of group not found');
  //   }

  //   await Gitlab.removeUserFromGroup(userGitlab, groupGitlab);
  // }

  // async updateUserGroupRole(manager: EntityManager, userId: UserId, organizationId: OrganizationId, organizationRoleId: OrganizationRoleId) {
  //   const [userGitlab, groupGitlab] = await Promise.all([
  //     manager.getRepository(UserGitlab).findOne({
  //       where: {
  //         userId,
  //       },
  //     }),
  //     manager.getRepository(OrganizationGitlab).findOne({
  //       where: {
  //         organizationId,
  //       },
  //     }),
  //   ]);

  //   if (userGitlab === null) {
  //     throw new Error('gitlab of user not found');
  //   }
  //   if (groupGitlab === null) {
  //     throw new Error('gitlab of group not found');
  //   }

  //   const accessLevel = this.convertOrganizationRoleIdToGitlabAccessLevel(organizationRoleId);
  //   await Gitlab.updateUserGroupRole(userGitlab, groupGitlab, accessLevel);
  // }

  // async addUserToProject(manager: EntityManager, userId: UserId, projectId: ProjectId, projectRoleId: ProjectRoleId) {
  //   const [userGitlab, projectGitlab] = await Promise.all([
  //     manager.getRepository(UserGitlab).findOne({
  //       where: {
  //         userId,
  //       },
  //     }),
  //     manager.getRepository(ProjectGitlab).findOne({
  //       where: {
  //         projectId,
  //       },
  //     }),
  //   ]);

  //   if (userGitlab === null) {
  //     throw new Error('gitlab of user not found');
  //   }
  //   if (projectGitlab === null) {
  //     throw new Error('gitlab of project not found');
  //   }

  //   const userProjectRoleState = await this.getUserProjectRoleState(manager, userId, projectId);
  //   if (userProjectRoleState.projectMaxRoleIdInTeam !== undefined) {
  //     if (userProjectRoleState.projectMaxRoleIdInTeam < projectRoleId) {
  //       await this.updateUserProjectRole(manager, userId, projectId, userProjectRoleState.projectMaxRoleIdInTeam);
  //     }
  //   } else {
  //     const accessLevel = this.convertProjectRoleToGitlabAccessLevel(projectRoleId);
  //     await Gitlab.addUserToProject(userGitlab, projectGitlab, accessLevel);
  //   }
  // }

  // async removeUserFromProject(manager: EntityManager, userId: UserId, projectId: ProjectId): Promise<void> {
  //   const [userGitlab, projectGitlab] = await Promise.all([
  //     manager.getRepository(UserGitlab).findOne({
  //       where: {
  //         userId,
  //       },
  //     }),
  //     manager.getRepository(ProjectGitlab).findOne({
  //       where: {
  //         projectId,
  //       },
  //     }),
  //   ]);

  //   if (userGitlab === null) {
  //     throw new Error('gitlab of user not found');
  //   }
  //   if (projectGitlab === null) {
  //     throw new Error('gitlab of project not found');
  //   }

  //   const userProjectRoleState = await this.getUserProjectRoleState(manager, userId, projectId);
  //   if (userProjectRoleState.projectMaxRoleIdInTeam !== undefined) {
  //     await this.updateUserProjectRole(manager, userId, projectId, userProjectRoleState.projectMaxRoleIdInTeam);
  //   } else {
  //     await Gitlab.removeUserFromProject(userGitlab, projectGitlab);
  //   }
  // }

  // async updateUserProjectRole(manager: EntityManager, userId: UserId, projectId: ProjectId, projectRoleId: ProjectRoleId) {
  //   const [userGitlab, projectGitlab] = await Promise.all([
  //     manager.getRepository(UserGitlab).findOne({
  //       where: {
  //         userId,
  //       },
  //     }),
  //     manager.getRepository(ProjectGitlab).findOne({
  //       where: {
  //         projectId,
  //       },
  //     }),
  //   ]);

  //   if (userGitlab === null) {
  //     throw new Error('gitlab of user not found');
  //   }
  //   if (projectGitlab === null) {
  //     throw new Error('gitlab of project not found');
  //   }

  //   const accessLevel = this.convertProjectRoleToGitlabAccessLevel(projectRoleId);
  //   await Gitlab.updateUserProjectRole(userGitlab, projectGitlab, accessLevel);
  // }

  // async getProjectFile(filePath: string, projectId: ProjectId) {
  //   const projectGitlab = await this.dataSource.getRepository(ProjectGitlab).findOne({ where: { projectId } });
  //   if (projectGitlab === null) {
  //     throw new Error(`gitlab of project ${projectId} not found`);
  //   }

  //   const file = await Gitlab.getProjectFile(filePath, projectGitlab);
  //   return file;
  // }

  // async getProjectFileTree(projectId: ProjectId) {
  //   const projectGitlab = await this.dataSource.getRepository(ProjectGitlab).findOne({ where: { projectId } });
  //   if (projectGitlab === null) {
  //     throw new Error(`gitlab of project ${projectId} not found`);
  //   }

  //   const fileTree = await Gitlab.getProjectFileTree(projectGitlab);
  //   return fileTree;
  // }

  // async getProjectFileMetaTree(projectId: ProjectId, path: string) {
  //   const projectGitlab = await this.dataSource.getRepository(ProjectGitlab).findOne({ where: { projectId } });
  //   if (projectGitlab === null) {
  //     throw new Error(`gitlab of project ${projectId} not found`);
  //   }

  //   const fileMetaTree = await Gitlab.getProjectFileMetaTree(path, projectGitlab);
  //   return fileMetaTree;
  // }

  // async getScriptFileMeta(projectId: ProjectId, typeFilter?: 'tree' | 'blob'): Promise<RepositoryFileMetaTree> {
  //   const projectGitlab = await this.dataSource.getRepository(ProjectGitlab).findOne({ where: { projectId } });
  //   if (projectGitlab === null) {
  //     throw new Error('gitlab of project not found');
  //   }

  //   const doguConfig = await this.readDoguConfig(projectGitlab);

  //   const getMetaFiles: Promise<RepositoryFileMetaTree>[] = [];
  //   for (const path of doguConfig.scriptFolderPaths) {
  //     getMetaFiles.push(Gitlab.getProjectFileMetaTree(path, projectGitlab));
  //   }

  //   const metaTrees = await Promise.all(getMetaFiles);
  //   const flatMetaTrees = metaTrees.flat();
  //   const scriptMetaTree = flatMetaTrees.filter((metaTree) => {
  //     if (metaTree.type === 'tree') {
  //       return typeFilter === 'blob' ? false : true;
  //     }

  //     if (metaTree.type === 'blob') {
  //       const allowedExtensions = ['.test.js', '.test.ts', '.spec.js', '.spec.ts'];
  //       for (const allowedExtension of allowedExtensions) {
  //         if (metaTree.name.endsWith(allowedExtension)) {
  //           return typeFilter === 'tree' ? false : true;
  //         }
  //       }
  //     }

  //     return false;
  //   });

  //   return scriptMetaTree;
  // }

  // private async readDoguConfig(projectGitlab: ProjectGitlab): Promise<DoguConfig> {
  //   const doguConfigFile = await Gitlab.getProjectFile('dogu.config.json', projectGitlab);
  //   const doguConfigJson = JSON.parse(Buffer.from(doguConfigFile.content, 'base64').toString());
  //   const existKeys = Object.keys(DoguConfigKeys);

  //   for (const key of existKeys) {
  //     if (doguConfigJson[key] === undefined) {
  //       throw new Error(`dogu.config.json is not valid. ${key} is not defined.`);
  //     }
  //   }

  //   return doguConfigJson;
  // }
}
