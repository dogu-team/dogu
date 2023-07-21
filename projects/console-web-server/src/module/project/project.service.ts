import {
  DestPropCamel,
  DeviceBase,
  DevicePropCamel,
  DevicePropSnake,
  MemberAndRoleGroupBase,
  OrganizationUserAndTeamPropCamel,
  ProjectAccessTokenPropCamel,
  ProjectAccessTokenPropSnake,
  ProjectAndTeamAndProjectRolePropCamel,
  ProjectAndUserAndProjectRolePropCamel,
  ProjectAndUserAndProjectRolePropSnake,
  ProjectPipelineReportResponse,
  ProjectPropCamel,
  ProjectPropSnake,
  ProjectResponse,
  RoutineDeviceJobPropCamel,
  RoutineJobPropCamel,
  RoutinePipelinePropCamel,
  RoutinePropCamel,
  RoutineStepPropCamel,
  TeamPropCamel,
  UserPropCamel,
  UserPropSnake,
} from '@dogu-private/console';
import { OrganizationId, PIPELINE_STATUS, ProjectId, REMOTE_DEVICE_JOB_STATE, UserId, UserPayload } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Brackets, DataSource, DeepPartial, EntityManager, Not } from 'typeorm';
import { v4 } from 'uuid';
import { Device, Project, RoutinePipeline, Token, User } from '../../db/entity';
import { ProjectAccessToken } from '../../db/entity/project-access-token.entity';
import { EMPTY_PAGE, Page } from '../../module/common/dto/pagination/page';
import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { UserPermission } from '../auth/guard/common';
// import { GitlabService } from '../gitlab/gitlab.service';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { TokenService } from '../token/token.service';
import { CreatePipelineReportDto, CreateProjectDto, FindMembersByProjectIdDto, FindProjectDeviceDto, FindProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    // @Inject(GitlabService)
    // private readonly gitlabService: GitlabService,
    @Inject(DeviceStatusService)
    private readonly deviceStatusService: DeviceStatusService,
  ) {}

  public async findProjectsWithAllRelations(projectId: ProjectId, withDeleted: boolean): Promise<Project | null> {
    const projectSelectQuery = withDeleted //
      ? this.dataSource.getRepository(Project).createQueryBuilder('project').withDeleted()
      : this.dataSource.getRepository(Project).createQueryBuilder('project');

    const project = await projectSelectQuery
      .leftJoinAndSelect(`project.${ProjectPropCamel.projectAndDevices}`, 'projectAndDevice')
      .leftJoinAndSelect(`project.${ProjectPropCamel.projectAndUserAndProjectRoles}`, 'projectUserRole')
      .leftJoinAndSelect(`project.${ProjectPropCamel.projectAndTeamAndProjectRoles}`, 'projectTeamRole')
      .leftJoinAndSelect(`project.${ProjectPropCamel.routines}`, 'routine')
      .leftJoinAndSelect(`routine.${RoutinePropCamel.routinePipelines}`, 'pipeline')
      .leftJoinAndSelect(`pipeline.${RoutinePipelinePropCamel.routineJobs}`, 'job')
      .leftJoinAndSelect(`job.${RoutineJobPropCamel.routineJobEdges}`, 'jobEdge')
      .leftJoinAndSelect(`job.${RoutineJobPropCamel.routineDeviceJobs}`, 'deviceJob')
      .leftJoinAndSelect(`deviceJob.${RoutineDeviceJobPropCamel.routineSteps}`, 'step')
      .leftJoinAndSelect(`step.${RoutineStepPropCamel.dests}`, 'dest')
      .leftJoinAndSelect(`dest.${DestPropCamel.destEdges}`, 'destEdge')
      .where(`project.${ProjectPropSnake.project_id} = :${ProjectPropCamel.projectId}`, { projectId })
      .getOne();

    return project;
  }

  public async softRemoveProject(projectId: ProjectId): Promise<void> {
    const project = await this.findProjectsWithAllRelations(projectId, false);
    if (!project) {
      throw new HttpException(`Project not found. projectId: ${projectId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Project).softRemove(project);
    });
  }

  private async findProjectsByOrganizationIdByOrganizationAdmin(organizationId: OrganizationId, dto: FindProjectDto): Promise<Page<ProjectResponse>> {
    const rv = await this.dataSource //
      .getRepository(Project)
      .createQueryBuilder('project')
      // .leftJoinAndSelect(`project.${ProjectPropCamel.users}`, 'user')
      .leftJoinAndSelect(`project.${ProjectPropCamel.projectAndUserAndProjectRoles}`, 'projectUserRole')
      .leftJoinAndSelect(`projectUserRole.${ProjectAndUserAndProjectRolePropCamel.user}`, 'user')
      // .leftJoinAndSelect(`project.${ProjectPropCamel.teams}`, 'team')
      .leftJoinAndSelect(`project.${ProjectPropCamel.projectAndTeamAndProjectRoles}`, 'projectTeamRole')
      .leftJoinAndSelect(`projectTeamRole.${ProjectAndTeamAndProjectRolePropCamel.team}`, 'team')
      .where(`project.${ProjectPropSnake.organization_id} = :${ProjectPropCamel.organizationId}`, { organizationId })
      .andWhere(`project.${ProjectPropSnake.name} LIKE :keyword`, { keyword: `%${dto.keyword}%` })
      .orderBy(`project.${ProjectPropCamel.updatedAt}`, 'DESC')
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit())
      .getManyAndCount();

    const projects = rv[0];

    const addMembersProjects = projects.map((project) => {
      const users = project.projectAndUserAndProjectRoles ? project.projectAndUserAndProjectRoles.map((item) => item.user).filter(notEmpty) : [];
      const teams = project.projectAndTeamAndProjectRoles ? project.projectAndTeamAndProjectRoles.map((item) => item.team).filter(notEmpty) : [];
      const members = [...users, ...teams];
      const sortedMember = members.sort((a, b) => {
        if (a.updatedAt > b.updatedAt) {
          return -1;
        } else {
          return 1;
        }
      });
      project.members = sortedMember;
      return project;
    });

    const count = rv[1];

    if (0 === projects.length) {
      return EMPTY_PAGE;
    }

    const page = new Page<ProjectResponse>(dto.page, dto.offset, count, addMembersProjects);
    return page;
  }

  private async findProjectsByOrganizationIdByOrganizationMember(organizationId: OrganizationId, userId: UserId, dto: FindProjectDto): Promise<Page<ProjectResponse>> {
    const rv = await this.dataSource //
      .getRepository(Project)
      .createQueryBuilder('project')
      // .leftJoinAndSelect(`project.${ProjectPropCamel.users}`, 'user')
      .leftJoinAndSelect(
        `project.${ProjectPropCamel.projectAndUserAndProjectRoles}`,
        'projectUserRole',
        `projectUserRole.${ProjectAndUserAndProjectRolePropSnake.user_id} = :${UserPropCamel.userId}`,
        { userId },
      )
      .leftJoinAndSelect(`projectUserRole.${ProjectAndUserAndProjectRolePropCamel.user}`, 'user')
      // .leftJoinAndSelect(`project.${ProjectPropCamel.teams}`, 'team')
      .leftJoinAndSelect(`project.${ProjectPropCamel.projectAndTeamAndProjectRoles}`, 'projectTeamRole')
      .leftJoinAndSelect(`projectTeamRole.${ProjectAndTeamAndProjectRolePropCamel.team}`, 'team')
      // .leftJoinAndSelect(
      //   `project.${ProjectPropCamel.projectAndUserAndProjectRoles}`, //
      //   'projectUserRole',
      //   `projectUserRole.${ProjectAndUserAndProjectRolePropSnake.user_id} = :${UserPropCamel.userId}`,
      //   { userId },
      // )
      .leftJoinAndSelect(
        `team.${TeamPropCamel.organizationAndUserAndTeams}`, //
        'userAndTeam',
        `userAndTeam.${OrganizationUserAndTeamPropCamel.userId} = :${UserPropCamel.userId}`,
      )
      .where(`project.${ProjectPropSnake.organization_id} = :${ProjectPropCamel.organizationId}`, { organizationId })
      .andWhere(`project.${ProjectPropSnake.name} LIKE :keyword`, { keyword: `%${dto.keyword}%` })
      .orderBy(`project.${ProjectPropCamel.updatedAt}`, 'DESC')
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit())
      .getManyAndCount();

    const projects = rv[0].filter((project) => {
      if (project?.projectAndTeamAndProjectRoles?.length !== 0 || project?.projectAndUserAndProjectRoles?.length !== 0) {
        return true;
      } else {
        return false;
      }
    });

    // 중복제거
    const projectFiltered = [...new Set(projects)];

    const addMembersProjects = projectFiltered.map((project) => {
      const users = project.projectAndUserAndProjectRoles ? project.projectAndUserAndProjectRoles.map((item) => item.user).filter(notEmpty) : [];
      const teams = project.projectAndTeamAndProjectRoles ? project.projectAndTeamAndProjectRoles.map((item) => item.team).filter(notEmpty) : [];
      const members = [...users, ...teams];
      const sortedMember = members.sort((a, b) => {
        if (a.updatedAt > b.updatedAt) {
          return -1;
        } else {
          return 1;
        }
      });
      project.members = sortedMember;
      return project;
    });

    const count = rv[1];

    if (0 === projects.length) {
      return EMPTY_PAGE;
    }

    const page = new Page<ProjectResponse>(dto.page, dto.offset, count, addMembersProjects);
    return page;
  }

  async findProjectsByOrganizationId(organizationId: OrganizationId, userId: UserId, dto: FindProjectDto): Promise<Page<ProjectResponse>> {
    const user = await this.dataSource //
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect(`user.${UserPropCamel.projects}`, 'project')
      .leftJoinAndSelect(`user.${UserPropCamel.organizationAndUserAndOrganizationRoles}`, 'orgUserRole')
      .where(`user.${UserPropSnake.user_id} = :${UserPropCamel.userId}`, { userId })
      .getOne();
    if (!user) {
      throw new HttpException(`User not found with id: ${userId}`, HttpStatus.NOT_FOUND);
    }

    const orgRole = user.organizationAndUserAndOrganizationRoles?.find((item) => item.organizationId === organizationId);
    if (!orgRole) {
      throw new HttpException(`This user is not a member of the organization`, HttpStatus.FORBIDDEN);
    }

    if (UserPermission.checkOrganizationRolePermission(orgRole.organizationRoleId, ORGANIZATION_ROLE.ADMIN)) {
      const rv = await this.findProjectsByOrganizationIdByOrganizationAdmin(organizationId, dto);
      return rv;
    } else {
      const rv = await this.findProjectsByOrganizationIdByOrganizationMember(organizationId, userId, dto);
      return rv;
    }
  }

  async findProject(organizationId: OrganizationId, projectId: ProjectId): Promise<ProjectResponse> {
    const project = await this.dataSource //
      .getRepository(Project)
      .findOne({
        where: { organizationId, projectId },
      });
    if (!project) {
      throw new NotFoundException(`Cannot find project id ${projectId}`);
    }
    return project;
  }

  async getProjectDetails(organizationId: OrganizationId, projectName: string): Promise<ProjectResponse> {
    const project = await this.dataSource.getRepository(Project).findOne({
      where: { organizationId, name: projectName },
      relations: ['users'],
    });

    if (!project) {
      throw new NotFoundException(`Cannot find project name ${projectName}`);
    }

    return project;
  }

  async createProject(manager: EntityManager, userId: UserId, organizationId: OrganizationId, createProjectDto: CreateProjectDto): Promise<ProjectResponse> {
    const { name, description } = createProjectDto;

    const project = await manager.getRepository(Project).findOne({ where: { organizationId, name } });
    if (project) {
      throw new HttpException(`This project name is already used. : teamId: ${organizationId}, proejctName: ${createProjectDto.name}`, HttpStatus.BAD_REQUEST);
    }

    const result = manager.getRepository(Project).create({
      name,
      description,
      managedBy: userId,
      organizationId: organizationId,
    });

    const rv = await manager.getRepository(Project).save(result);
    await this.createAccessToken(manager, rv.projectId);

    return rv;
  }

  async updateProject(organizationId: OrganizationId, projectId: ProjectId, updateProjectDto: UpdateProjectDto): Promise<ProjectResponse> {
    const project = await this.dataSource.getRepository(Project).findOne({ where: { projectId, organizationId } });

    if (!project) {
      throw new HttpException(`Project with ${projectId} not found`, HttpStatus.NOT_FOUND);
    }

    const existingProject = await this.dataSource.getRepository(Project).findOne({
      where: { projectId: Not(projectId), organizationId, name: updateProjectDto.name },
    });
    if (existingProject) {
      throw new HttpException(`Project name ${updateProjectDto.name} is already exist`, HttpStatus.BAD_REQUEST);
    }

    const newData = Object.assign(project, updateProjectDto);

    const rv = await this.dataSource.transaction(async (manager) => {
      const project = await manager.getRepository(Project).save(newData);
      return project;
    });

    return rv;
  }

  async findMembersByProjectId(
    organizationId: OrganizationId, //
    projectId: ProjectId,
    dto: FindMembersByProjectIdDto,
  ): Promise<Page<MemberAndRoleGroupBase>> {
    const project = await this.dataSource //
      .getRepository(Project)
      .createQueryBuilder('project')
      .leftJoinAndSelect(`project.${ProjectPropCamel.projectAndUserAndProjectRoles}`, 'projectUserRole')
      .leftJoinAndSelect(`projectUserRole.${ProjectAndUserAndProjectRolePropCamel.user}`, 'user')
      .leftJoinAndSelect(`projectUserRole.${ProjectAndUserAndProjectRolePropCamel.projectRole}`, 'userRole')
      .leftJoinAndSelect(`project.${ProjectPropCamel.projectAndTeamAndProjectRoles}`, 'projectTeamRole')
      .leftJoinAndSelect(`projectTeamRole.${ProjectAndTeamAndProjectRolePropCamel.team}`, 'team')
      .leftJoinAndSelect(`projectTeamRole.${ProjectAndTeamAndProjectRolePropCamel.projectRole}`, 'teamRole')
      .where(`project.${ProjectPropSnake.project_id} = :${ProjectPropCamel.projectId}`, { projectId })
      .andWhere(`project.${ProjectPropSnake.organization_id} = :${ProjectPropCamel.organizationId}`, { organizationId })
      .andWhere(`project.${ProjectPropSnake.name} LIKE :keyword`, { keyword: `%${dto.keyword}%` })
      .getOne();

    if (!project) {
      throw new HttpException(`Project with ${projectId} not found`, HttpStatus.NOT_FOUND);
    }

    const userAndRoleGroups = project.projectAndUserAndProjectRoles ? project.projectAndUserAndProjectRoles : [];
    const teamAndRoleGroups = project.projectAndTeamAndProjectRoles ? project.projectAndTeamAndProjectRoles : [];

    const memberAndRoleGroups = [...userAndRoleGroups, ...teamAndRoleGroups].sort((a, b) => {
      if (a.createdAt > b.createdAt) {
        return 1;
      } else {
        return -1;
      }
    });

    if (0 === memberAndRoleGroups.length) {
      return EMPTY_PAGE;
    }

    const memberAndRoleGroupSlice = memberAndRoleGroups.slice(dto.getDBOffset(), dto.getDBOffset() + dto.getDBLimit());

    const page = new Page<MemberAndRoleGroupBase>(dto.page, dto.offset, memberAndRoleGroups.length, memberAndRoleGroupSlice);
    return page;
  }

  async findProjectDevices(organizationId: OrganizationId, projectId: ProjectId, dto: FindProjectDeviceDto): Promise<Page<DeviceBase>> {
    const project = await this.dataSource.getRepository(Project).findOne({ where: { projectId, organizationId } });
    if (!project) {
      throw new NotFoundException('Cannot find project');
    }

    const qb = this.dataSource.getRepository(Device).createQueryBuilder('device');
    const connectionStateFilterClause = dto.connectionState !== undefined ? 'device.connection_state IN (:connectionState)' : '1=1';

    const enabledProjectDeviceSubQuery = this.deviceStatusService.enabledProjectDeviceSubQuery(qb, organizationId, projectId);

    const rawPagedDevicesQuery = qb
      .where(`device.${DevicePropSnake.device_id} IN ${enabledProjectDeviceSubQuery.getQuery()}`)
      .andWhere(connectionStateFilterClause, { connectionState: dto.connectionState })
      .andWhere(
        new Brackets((qb) => {
          qb.where(`device.${DevicePropSnake.name} LIKE :keyword`, { keyword: `%${dto.keyword}%` })
            .orWhere(`device.${DevicePropSnake.model} LIKE :keyword`, { keyword: `%${dto.keyword}%` })
            .orWhere(`device.${DevicePropSnake.model_name} LIKE :keyword`, { keyword: `%${dto.keyword}%` });
        }),
      )
      .leftJoinAndSelect(`device.${DevicePropCamel.deviceTags}`, 'deviceTags')
      .leftJoinAndSelect(`device.${DevicePropCamel.routineDeviceJobs}`, 'deviceJob', `deviceJob.status IN (:...status)`, {
        status: [PIPELINE_STATUS.WAITING, PIPELINE_STATUS.IN_PROGRESS, PIPELINE_STATUS.CANCEL_REQUESTED],
      })
      .leftJoinAndSelect(`device.${DevicePropCamel.remoteDeviceJobs}`, 'remoteDeviceJob', `remoteDeviceJob.state IN (:...state)`, {
        state: [REMOTE_DEVICE_JOB_STATE.WAITING, REMOTE_DEVICE_JOB_STATE.IN_PROGRESS],
      })
      .leftJoinAndSelect(`device.${DevicePropCamel.projects}`, 'project')
      .innerJoinAndSelect(`device.${DevicePropSnake.host}`, 'host')
      .orderBy(`device.${DevicePropCamel.updatedAt}`, 'DESC')
      .take(dto.getDBLimit())
      .skip(dto.getDBOffset());

    const [devices, totalCount] = await rawPagedDevicesQuery.getManyAndCount();

    return new Page<DeviceBase>(dto.page, dto.offset, totalCount, devices);
  }

  async createPipelineReport(userPayload: UserPayload, organizationId: OrganizationId, projectId: ProjectId, dto: CreatePipelineReportDto): Promise<ProjectPipelineReportResponse> {
    const qb = this.dataSource.getRepository(RoutinePipeline).createQueryBuilder('pipeline');
    const { from, to } = dto;

    const [pipelines, total] = await qb
      .where({ projectId })
      .andWhere('created_at BETWEEN :from AND :to', { from, to: to ?? new Date() })
      .getManyAndCount();

    let runtime = 0;
    let successes = 0;
    let failures = 0;

    pipelines.forEach((pipeline) => {
      if (pipeline.status === PIPELINE_STATUS.SUCCESS) {
        successes++;
      } else if (pipeline.status === PIPELINE_STATUS.FAILURE) {
        failures++;
      }

      if (!!pipeline.inProgressAt && !!pipeline.completedAt) {
        runtime += new Date(pipeline.completedAt).getTime() - new Date(pipeline.inProgressAt).getTime();
      }
    });

    return {
      runtime,
      total,
      successes,
      failures,
    };
  }

  private async createAccessToken(manager: EntityManager, projectId: ProjectId): Promise<string> {
    const tokenCheck = await manager.getRepository(ProjectAccessToken).findOne({
      where: { projectId },
    });

    if (tokenCheck) {
      throw new HttpException(`AccessToken already exists. projectId: ${projectId}`, HttpStatus.BAD_REQUEST);
    }

    const newTokenData: DeepPartial<Token> = {
      token: TokenService.createProjectAccessToken(),
      expiredAt: null,
    };
    const tokenData = manager.getRepository(Token).create(newTokenData);
    const token = await manager.getRepository(Token).save(tokenData);

    const newData: DeepPartial<ProjectAccessToken> = {
      projectAccessTokenId: v4(),
      projectId,
      creatorId: null,
      revokerId: null,
      tokenId: token.tokenId,
    };
    const accessTokenData = manager.getRepository(ProjectAccessToken).create(newData);
    await manager.getRepository(ProjectAccessToken).save(accessTokenData);

    return token.token;
  }

  async findAccessToken(projectId: ProjectId): Promise<string> {
    const accessToken = await this.dataSource //
      .getRepository(ProjectAccessToken)
      .createQueryBuilder('projectAccessToken')
      .innerJoinAndSelect(`projectAccessToken.${ProjectAccessTokenPropCamel.token}`, 'token')
      .where(`projectAccessToken.${ProjectAccessTokenPropSnake.project_id} = :projectId`, { projectId })
      .getOne();

    if (!accessToken) {
      throw new HttpException(`AccessToken not found. projectId: ${projectId}`, HttpStatus.NOT_FOUND);
    }

    return accessToken.token.token;
  }

  async regenerateAccessToken(projectId: ProjectId, regeneratorId: UserId): Promise<string> {
    const accessToken = await this.dataSource //
      .getRepository(ProjectAccessToken)
      .createQueryBuilder('projectAccessToken')
      .innerJoinAndSelect(`projectAccessToken.${ProjectAccessTokenPropCamel.token}`, 'token')
      .where(`projectAccessToken.${ProjectAccessTokenPropSnake.project_id} = :projectId`, { projectId })
      .getOne();

    if (!accessToken) {
      throw new HttpException(`AccessToken not found. projectId: ${projectId}`, HttpStatus.NOT_FOUND);
    }

    const rv = await this.dataSource.transaction(async (manager) => {
      // revoke
      await manager.getRepository(Token).softDelete({ tokenId: accessToken.tokenId });
      await manager.getRepository(ProjectAccessToken).update({ projectAccessTokenId: accessToken.projectAccessTokenId }, { revokerId: regeneratorId });
      await manager.getRepository(ProjectAccessToken).softDelete({ projectAccessTokenId: accessToken.projectAccessTokenId });

      // reissue
      const newTokenData: DeepPartial<Token> = {
        token: TokenService.createProjectAccessToken(),
      };
      const tokenData = manager.getRepository(Token).create(newTokenData);
      const token = await manager.getRepository(Token).save(tokenData);

      const newData: DeepPartial<ProjectAccessToken> = {
        projectAccessTokenId: v4(),
        projectId,
        creatorId: regeneratorId,
        tokenId: token.tokenId,
      };
      const accessTokenData = manager.getRepository(ProjectAccessToken).create(newData);
      await manager.getRepository(ProjectAccessToken).save(accessTokenData);

      return token.token;
    });

    return rv;
  }

  async deleteAccessToken(projectId: ProjectId, revokerId: UserId): Promise<void> {
    const accessToken = await this.dataSource //
      .getRepository(ProjectAccessToken)
      .createQueryBuilder('projectAccessToken')
      .innerJoinAndSelect(`projectAccessToken.${ProjectAccessTokenPropCamel.token}`, 'token')
      .where(`projectAccessToken.${ProjectAccessTokenPropSnake.project_id} = :projectId`, { projectId })
      .getOne();

    if (!accessToken) {
      throw new HttpException(`AccessToken not found. projectId: ${projectId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Token).softDelete({ tokenId: accessToken.tokenId });
      await manager.getRepository(ProjectAccessToken).update({ projectAccessTokenId: accessToken.projectAccessTokenId }, { revokerId });
      await manager.getRepository(ProjectAccessToken).softDelete({ projectAccessTokenId: accessToken.projectAccessTokenId });
    });
  }
}
