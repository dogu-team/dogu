import {
  OrganizationUserAndTeamPropCamel,
  OrganizationUserAndTeamPropSnake,
  ProjectAndTeamAndProjectRoleBase,
  ProjectAndTeamAndProjectRolePropCamel,
  ProjectAndTeamAndProjectRolePropSnake,
  ProjectPropSnake,
  TeamBase,
  TeamPropCamel,
  TeamPropSnake,
  TeamResponse,
  UserPropCamel,
  UserPropSnake,
  UserResponse,
} from '@dogu-private/console';
import { OrganizationId, TeamId, UserId } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Brackets, DataSource } from 'typeorm';
import { OrganizationAndUserAndTeam } from '../../../db/entity/relations/organization-and-user-and-team.entity';
import { ProjectAndTeamAndProjectRole } from '../../../db/entity/relations/project-and-team-and-project-role.entity';
import { Team } from '../../../db/entity/team.entity';
import { User } from '../../../db/entity/user.entity';
import { EMPTY_PAGE, Page } from '../../common/dto/pagination/page';
import { FindProjectsByTeamIdDto, FindUsersByTeamIdDto } from '../../user/dto/user.dto';
import { AddTeamUserDto, CreateTeamDto, FindTeamsDto, UpdateTeamDto } from './dto/team.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findTeamsByOrganizationId(organizationId: OrganizationId, dto: FindTeamsDto): Promise<Page<TeamBase>> {
    const rv = await this.dataSource //
      .getRepository(Team)
      .createQueryBuilder('team')
      .leftJoinAndSelect(`team.${TeamPropCamel.projectAndTeamAndProjectRoles}`, 'projectTeamRole')
      .leftJoinAndSelect(`team.${TeamPropCamel.organizationAndUserAndTeams}`, 'userAndTeam')
      .leftJoinAndSelect(`userAndTeam.${OrganizationUserAndTeamPropCamel.user}`, 'user')
      .where(`team.${TeamPropSnake.organization_id} = :organizationId`, { organizationId })
      .andWhere(`team.${TeamPropSnake.name} LIKE :keyword`, { keyword: `%${dto.keyword}%` })
      .orderBy(`team.${TeamPropCamel.updatedAt}`, 'DESC')
      .take(dto.getDBLimit())
      .skip(dto.getDBOffset())
      .getManyAndCount();

    const teams = rv[0];
    if (0 === teams.length) {
      return EMPTY_PAGE;
    }
    teams.map((team) => {
      const users = team.organizationAndUserAndTeams?.flatMap((orgUserTeam) => orgUserTeam.user).filter(notEmpty);
      team.users = users ? users : [];
    });

    const total = rv[1];

    const page = new Page<TeamResponse>(dto.page, dto.offset, total, teams);
    return page;
  }

  async findTeamByTeamId(organizationId: OrganizationId, teamId: TeamId): Promise<TeamBase> {
    const team = await this.dataSource
      .getRepository(Team)
      .createQueryBuilder('team')
      .leftJoinAndSelect(`team.${TeamPropCamel.organizationAndUserAndTeams}`, 'orgUserTeam')
      .leftJoinAndSelect(`orgUserTeam.${OrganizationUserAndTeamPropCamel.user}`, 'user')
      .where(`team.${TeamPropSnake.organization_id}= :${TeamPropCamel.organizationId}`, { organizationId })
      .andWhere(`team.${TeamPropSnake.team_id} = :${TeamPropCamel.teamId}`, { teamId })
      .getOne();

    if (!team) {
      throw new HttpException(`Team not found: ${teamId}`, HttpStatus.NOT_FOUND);
    }

    const users = team.organizationAndUserAndTeams?.flatMap((orgUserTeam) => orgUserTeam.user).filter(notEmpty);
    team.users = users ? users : [];

    return team;
  }

  async createTeam(organizationId: OrganizationId, dto: CreateTeamDto): Promise<TeamBase> {
    const team = await this.dataSource.getRepository(Team).findOne({ where: { organizationId, name: dto.name } });
    if (team) {
      throw new HttpException(`Team name is duplicated: ${dto.name}`, HttpStatus.CONFLICT);
    }

    const newData = this.dataSource.getRepository(Team).create({ organizationId, name: dto.name });
    const rv = await this.dataSource.getRepository(Team).save(newData);
    return rv;
  }

  async updateTeam(organizationId: OrganizationId, teamId: TeamId, dto: UpdateTeamDto): Promise<TeamResponse> {
    const team = await this.dataSource.getRepository(Team).findOne({ where: { organizationId, teamId } });
    if (!team) {
      throw new HttpException(`Team not found: ${teamId}`, HttpStatus.NOT_FOUND);
    }

    const duplicatedNamedTeam = await this.dataSource.getRepository(Team).findOne({
      where: { organizationId: organizationId, name: dto.name },
    });
    if (duplicatedNamedTeam) {
      throw new HttpException(`Team name is duplicated: ${dto.name}`, HttpStatus.CONFLICT);
    }

    const newData = Object.assign(team, dto);
    const rv = await this.dataSource.getRepository(Team).save(newData);
    return rv;
  }

  async addUserToTeam(organizationId: OrganizationId, teamId: TeamId, dto: AddTeamUserDto): Promise<void> {
    const { userId } = dto;
    // user, team, org id is foreign key
    const orgUserTeam = await this.dataSource //
      .getRepository(OrganizationAndUserAndTeam)
      .findOne({ where: { organizationId, teamId, userId }, withDeleted: true });

    await this.dataSource.transaction(async (manager) => {
      if (!orgUserTeam) {
        const newData = manager.getRepository(OrganizationAndUserAndTeam).create({ organizationId, teamId, userId });
        await this.dataSource.getRepository(OrganizationAndUserAndTeam).save(newData);
      } else if (orgUserTeam.deletedAt !== null) {
        await manager.getRepository(OrganizationAndUserAndTeam).recover(orgUserTeam);
      } else {
        throw new HttpException(`User is already in team: ${dto.userId}`, HttpStatus.CONFLICT);
      }
    });
    return;
  }

  async softRemoveUserFromTeam(organizationId: OrganizationId, teamId: TeamId, userId: UserId): Promise<void> {
    // user, team, org id is foreign key
    const userAndTeam = await this.dataSource.getRepository(OrganizationAndUserAndTeam).findOne({ where: { organizationId, teamId, userId } });
    if (!userAndTeam) {
      throw new HttpException(`User is not in team: ${userId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(OrganizationAndUserAndTeam).softRemove(userAndTeam);
    });
    return;
  }

  public async findTeamsWithAllRelations(teamId: TeamId, withDeleted: boolean): Promise<Team | null> {
    const teamSelectQuery = withDeleted //
      ? this.dataSource.getRepository(Team).createQueryBuilder('team').withDeleted()
      : this.dataSource.getRepository(Team).createQueryBuilder('team');

    const team = await teamSelectQuery //
      .leftJoinAndSelect(`team.${TeamPropCamel.projectAndTeamAndProjectRoles}`, 'projectTeamRole')
      .leftJoinAndSelect(`team.${TeamPropCamel.organizationAndUserAndTeams}`, 'orgUserTeam')
      .where(`team.${TeamPropSnake.team_id} = :teamId`, { teamId })
      .getOne();

    return team;
  }

  public async softRemoveTeam(teamId: TeamId): Promise<void> {
    const team = await this.findTeamsWithAllRelations(teamId, false);
    if (!team) {
      throw new HttpException(`Team not found: ${teamId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      const orgId = team.organizationId;
      const projectIds = team.projectAndTeamAndProjectRoles ? team.projectAndTeamAndProjectRoles.map((projectTeamRole) => projectTeamRole.projectId) : [];

      await manager.getRepository(Team).softRemove(team);
    });
  }

  async findUserByTeamId(organizationId: OrganizationId, teamId: TeamId, dto: FindUsersByTeamIdDto): Promise<Page<UserResponse>> {
    const rv = await this.dataSource //
      .getRepository(User)
      .createQueryBuilder('user')
      .innerJoinAndSelect(
        `user.${UserPropCamel.organizationAndUserAndTeams}`,
        'userAndTeam',
        `userAndTeam.${OrganizationUserAndTeamPropSnake.organization_id} = :${OrganizationUserAndTeamPropCamel.organizationId} AND userAndTeam.${OrganizationUserAndTeamPropSnake.team_id} = :${OrganizationUserAndTeamPropCamel.teamId}`,
        { organizationId, teamId },
      )
      .where(
        new Brackets((qb) => {
          qb.where(`replace(user.${UserPropSnake.name}, ' ', '') LIKE :keyword`, { keyword: `%${dto.keyword}%` })
            .orWhere(`user.${UserPropSnake.name} LIKE :keyword`, { keyword: `%${dto.keyword}%` })
            .orWhere(`user.${UserPropSnake.email} LIKE :keyword`, { keyword: `%${dto.keyword}%` });
        }),
      )
      .orderBy(`user.${UserPropCamel.createdAt}`, 'ASC')
      .take(dto.getDBLimit())
      .skip(dto.getDBOffset())
      .getManyAndCount();

    const users = rv[0];
    if (0 === users.length) {
      return EMPTY_PAGE;
    }

    const count = rv[1];

    const page = new Page<UserResponse>(dto.page, dto.offset, count, users);
    return page;
  }

  async findProjectsByTeamId(teamId: TeamId, dto: FindProjectsByTeamIdDto): Promise<Page<ProjectAndTeamAndProjectRoleBase>> {
    const rv = await this.dataSource //
      .getRepository(ProjectAndTeamAndProjectRole)
      .createQueryBuilder('projectTeamRole')
      .innerJoinAndSelect(`projectTeamRole.${ProjectAndTeamAndProjectRolePropCamel.project}`, 'project')
      .where(`projectTeamRole.${ProjectAndTeamAndProjectRolePropSnake.team_id} = :${ProjectAndTeamAndProjectRolePropCamel.teamId}`, { teamId })
      .andWhere(`project.${ProjectPropSnake.name} LIKE :keyword`, { keyword: `%${dto.keyword}%` })
      .orderBy(`projectTeamRole.${ProjectAndTeamAndProjectRolePropCamel.createdAt}`, 'ASC')
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit())
      .getManyAndCount();

    const teamAndRoleGroups = rv[0];
    if (0 === teamAndRoleGroups.length) {
      return EMPTY_PAGE;
    }

    const count = rv[1];

    const page = new Page<ProjectAndTeamAndProjectRoleBase>(dto.page, dto.offset, count, teamAndRoleGroups);
    return page;
  }
}
