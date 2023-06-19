import { OrganizationId, ProjectId, TeamId } from '@dogu-private/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProjectRole } from '../../../db/entity/project-role.entity';
import { ProjectAndTeamAndProjectRole } from '../../../db/entity/relations/project-and-team-and-project-role.entity';
import { GitlabService } from '../../gitlab/gitlab.service';
import { AddTeamToProjectDto, UpdateTeamProjectRoleDto } from './dto/project-team.dto';

@Injectable()
export class ProjectTeamService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(GitlabService)
    private readonly gitlabService: GitlabService,
  ) {}

  async addTeamToProject(organizationId: OrganizationId, projectId: ProjectId, dto: AddTeamToProjectDto): Promise<void> {
    const { teamId, projectRoleId } = dto;
    const projectRole = await this.dataSource.getRepository(ProjectRole).findOne({ where: { projectRoleId } });
    if (!projectRole) {
      throw new HttpException(`project-role with ${projectRoleId} not found`, HttpStatus.NOT_FOUND);
    }

    const projectTeamRole = await this.dataSource.getRepository(ProjectAndTeamAndProjectRole).findOne({ where: { projectId, teamId }, withDeleted: true });

    await this.dataSource.transaction(async (manager) => {
      if (!projectTeamRole) {
        const newData = manager.getRepository(ProjectAndTeamAndProjectRole).create({ projectId, teamId, projectRoleId });
        await manager.getRepository(ProjectAndTeamAndProjectRole).save(newData);
      } else if (projectTeamRole.deletedAt) {
        await manager.getRepository(ProjectAndTeamAndProjectRole).recover(projectTeamRole);
        await manager.getRepository(ProjectAndTeamAndProjectRole).update({ projectId, teamId }, { projectRoleId });
      } else {
        throw new HttpException(`Team with ${teamId} is already in project.`, HttpStatus.CONFLICT);
      }
      await this.gitlabService.addTeamToProject(manager, organizationId, projectId, teamId, projectRoleId);
    });
  }

  async updateTeamProjectRole(organizationId: OrganizationId, projectId: ProjectId, teamId: TeamId, dto: UpdateTeamProjectRoleDto): Promise<void> {
    const projectRole = await this.dataSource.getRepository(ProjectRole).findOne({ where: { projectRoleId: dto.projectRoleId } });
    if (!projectRole) {
      throw new HttpException(`Role group with ${dto.projectRoleId} not found`, HttpStatus.NOT_FOUND);
    }

    const projectTeamRole = await this.dataSource.getRepository(ProjectAndTeamAndProjectRole).findOne({ where: { projectId, teamId } });
    if (!projectTeamRole) {
      throw new HttpException(`Team with ${teamId} is not in project`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      const newData = Object.assign(projectTeamRole, { projectRoleId: dto.projectRoleId });
      await manager.getRepository(ProjectAndTeamAndProjectRole).save(newData);
      await this.gitlabService.updateTeamRoleToGroup(manager, projectId, teamId, dto.projectRoleId);
    });
  }

  async softRemoveTeamFromProject(organizationId: OrganizationId, projectId: ProjectId, teamId: TeamId): Promise<void> {
    const projectTeamRole = await this.dataSource.getRepository(ProjectAndTeamAndProjectRole).findOne({ where: { projectId, teamId } });
    if (!projectTeamRole) {
      throw new HttpException(`Team with ${teamId} is not in project`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(ProjectAndTeamAndProjectRole).softRemove(projectTeamRole);
      await this.gitlabService.removeTeamFromProject(manager, organizationId, projectId, teamId);
    });
  }
}
