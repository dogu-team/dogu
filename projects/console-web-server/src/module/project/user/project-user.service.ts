import { OrganizationId, ProjectId, UserId } from '@dogu-private/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProjectRole } from '../../../db/entity/project-role.entity';
import { ProjectAndUserAndProjectRole } from '../../../db/entity/relations/project-and-user-and-project-role.entity';
import { GitlabService } from '../../gitlab/gitlab.service';
import { AddUserToProjectDto, UpdateUserProjectRoleDto } from './dto/project-user.dto';

@Injectable()
export class ProjectUserService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(GitlabService)
    private readonly gitlabService: GitlabService,
  ) {}

  async addUserToProject(organizationId: OrganizationId, projectId: ProjectId, dto: AddUserToProjectDto): Promise<void> {
    const { projectRoleId, userId } = dto;
    const projectRole = await this.dataSource.getRepository(ProjectRole).findOne({ where: { projectRoleId } });
    if (!projectRole) {
      throw new HttpException(`project-role with ${dto.projectRoleId} not found`, HttpStatus.NOT_FOUND);
    }

    const projectUserRole = await this.dataSource.getRepository(ProjectAndUserAndProjectRole).findOne({ where: { projectId, userId }, withDeleted: true });

    await this.dataSource.transaction(async (manager) => {
      if (!projectUserRole) {
        const newData = manager.getRepository(ProjectAndUserAndProjectRole).create({ projectId, userId, projectRoleId });
        await manager.getRepository(ProjectAndUserAndProjectRole).save(newData);
      } else if (projectUserRole.deletedAt) {
        await manager.getRepository(ProjectAndUserAndProjectRole).recover(projectUserRole);
        await manager.getRepository(ProjectAndUserAndProjectRole).update({ projectId, userId }, { projectRoleId });
      } else {
        throw new HttpException(`User with ${dto.userId} is already in project.`, HttpStatus.CONFLICT);
      }
      await this.gitlabService.addUserToProject(manager, userId, projectId, projectRoleId);
    });
  }

  async updateUserProjectRole(organizationId: OrganizationId, projectId: ProjectId, userId: UserId, dto: UpdateUserProjectRoleDto): Promise<void> {
    const projectRole = await this.dataSource.getRepository(ProjectRole).findOne({ where: { projectRoleId: dto.projectRoleId } });
    if (!projectRole) {
      throw new HttpException(`project-role with ${dto.projectRoleId} not found`, HttpStatus.NOT_FOUND);
    }

    const projectUserRole = await this.dataSource.getRepository(ProjectAndUserAndProjectRole).findOne({ where: { projectId, userId } });
    if (!projectUserRole) {
      throw new HttpException(`User with ${userId} is not in project`, HttpStatus.NOT_FOUND);
    }

    const newData = Object.assign(projectUserRole, { projectRoleId: dto.projectRoleId });
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(ProjectAndUserAndProjectRole).save(newData);
      await this.gitlabService.updateUserProjectRole(manager, userId, projectId, dto.projectRoleId);
    });
  }

  async softRemoveUserFromProject(organizationId: OrganizationId, projectId: ProjectId, userId: UserId): Promise<void> {
    // projectId, userId are foreign key
    const projectUserRole = await this.dataSource.getRepository(ProjectAndUserAndProjectRole).findOne({ where: { projectId, userId } });
    if (!projectUserRole) {
      throw new HttpException(`User with ${userId} is not in project`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      await this.gitlabService.removeUserFromProject(manager, userId, projectId);
      await manager.getRepository(ProjectAndUserAndProjectRole).softRemove(projectUserRole);
    });
  }
}
