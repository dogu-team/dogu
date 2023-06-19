import { OrganizationPropCamel, ProjectAndTeamAndProjectRoleBase, TeamBase, TeamResponse, UserResponse } from '@dogu-private/console';
import { OrganizationId, TeamId, UserId, UserPayload } from '@dogu-private/types';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ORGANIZATION_ROLE } from '../../auth/auth.types';
import { OrganizationPermission, User } from '../../auth/decorators';
import { Page } from '../../common/dto/pagination/page';
import { FindProjectsByTeamIdDto, FindUsersByTeamIdDto } from '../../user/dto/user.dto';
import { AddTeamUserDto, CreateTeamDto, FindTeamsDto, UpdateTeamDto } from './dto/team.dto';
import { TeamService } from './team.service';

@Controller('organizations/:organizationId/teams')
export class TeamController {
  constructor(
    @Inject(TeamService)
    private readonly teamService: TeamService,
  ) {}

  @Post()
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async createTeam(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Body() dto: CreateTeamDto): Promise<TeamResponse> {
    const rv = await this.teamService.createTeam(organizationId, dto);
    return rv;
  }

  @Get()
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findTeamsByOrganizationId(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Query() dto: FindTeamsDto): Promise<Page<TeamResponse>> {
    const rv = await this.teamService.findTeamsByOrganizationId(organizationId, dto);
    return rv;
  }

  @Get(':teamId')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findTeamByTeamId(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Param('teamId') teamId: TeamId): Promise<TeamResponse> {
    const rv = await this.teamService.findTeamByTeamId(organizationId, teamId);
    return rv;
  }

  @Patch(':teamId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async updateTeam(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Param('teamId') teamId: TeamId, @Body() dto: UpdateTeamDto): Promise<TeamBase> {
    const rv = await this.teamService.updateTeam(organizationId, teamId, dto);
    return rv;
  }

  @Delete(':teamId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async softRemoveTeam(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param('teamId') teamId: TeamId,
  ): Promise<void> {
    await this.teamService.softRemoveTeam(teamId);
    return;
  }

  @Get(':teamId/users')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findUsersByTeamId(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param('teamId') teamId: TeamId,
    @Query() dto: FindUsersByTeamIdDto,
  ): Promise<Page<UserResponse>> {
    const rv = await this.teamService.findUserByTeamId(organizationId, teamId, dto);
    return rv;
  }

  @Post(':teamId/users')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async addUserToTeam(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, @Param('teamId') teamId: TeamId, @Body() dto: AddTeamUserDto): Promise<void> {
    await this.teamService.addUserToTeam(organizationId, teamId, dto);
  }

  @Delete(':teamId/users/:userId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async softRemoveUserFromTeam(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Param('teamId') teamId: TeamId,
    @Param('userId') userId: UserId,
    @User() userPayload: UserPayload,
  ): Promise<void> {
    if (userPayload.userId === userId) {
      throw new HttpException('Can not delete yourself from team', HttpStatus.BAD_REQUEST);
    }
    await this.teamService.softRemoveUserFromTeam(organizationId, teamId, userId);
  }

  @Get(':teamId/projects')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findProjectsByTeamId(
    // @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param('teamId') teamId: TeamId,
    @Query() dto: FindProjectsByTeamIdDto,
  ): Promise<Page<ProjectAndTeamAndProjectRoleBase>> {
    const rv = await this.teamService.findProjectsByTeamId(teamId, dto);
    return rv;
  }
}
