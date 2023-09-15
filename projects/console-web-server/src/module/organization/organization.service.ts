import {
  DestPropCamel,
  OrganizationAccessTokenPropCamel,
  OrganizationAccessTokenPropSnake,
  OrganizationAndUserAndOrganizationRolePropCamel,
  OrganizationAndUserAndOrganizationRolePropSnake,
  OrganizationBase,
  OrganizationPropCamel,
  OrganizationPropSnake,
  OrganizationResponse,
  ProjectPropCamel,
  RoutineDeviceJobPropCamel,
  RoutineJobPropCamel,
  RoutinePipelinePropCamel,
  RoutinePropCamel,
  RoutineStepPropCamel,
  UserAndInvitationTokenBase,
  UserAndInvitationTokenPropCamel,
  UserAndInvitationTokenPropSnake,
  UserPropCamel,
  UserPropSnake,
} from '@dogu-private/console';
import { OrganizationId, UserId, UserPayload, USER_INVITATION_STATUS } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import crypto from 'crypto';
import { DataSource, DeepPartial, EntityManager, In } from 'typeorm';
import { v4 } from 'uuid';

import {
  Dest,
  DestEdge,
  Device,
  DeviceTag,
  Host,
  Organization,
  OrganizationAndUserAndOrganizationRole,
  OrganizationAndUserAndTeam,
  OrganizationKey,
  Project,
  ProjectAndDevice,
  ProjectAndTeamAndProjectRole,
  ProjectAndUserAndProjectRole,
  RoutineDeviceJob,
  RoutineJob,
  RoutineJobEdge,
  RoutinePipeline,
  Team,
  Token,
  User,
} from '../../db/entity';
import { OrganizationAccessToken } from '../../db/entity/organization-access-token.entity';
import { UserAndInvitationToken } from '../../db/entity/relations/user-and-invitation-token.entity';
import { Routine } from '../../db/entity/routine.entity';
import { RoutineStep } from '../../db/entity/step.entity';
import { UserVisit } from '../../db/entity/user-visit.entity';
import { FeatureLicenseService } from '../../enterprise/module/license/feature-license.service';
import { FEATURE_CONFIG } from '../../feature.config';
import { castEntity } from '../../types/entity-cast';
import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { EMPTY_PAGE, Page } from '../common/dto/pagination/page';
import { EmailService } from '../email/email.service';
import { OrganizationFileService } from '../file/organization-file.service';
import { ApplicationService } from '../project/application/application.service';
import { ProjectService } from '../project/project.service';
import { RoutineService } from '../routine/routine.service';
import { TokenService } from '../token/token.service';
import { AcceptUserInvitationDto } from '../user-invitation/dto/user-invitation.dto';
import { UserInvitationService } from '../user-invitation/user-invitation.service';
import { createOrganizationDto, FindInvitationsDto, InviteEmailDto, UpdateOrganizationDto, UpdateOrganizationOwnerDto, UpdateOrganizationRoleDto } from './dto/organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(EmailService)
    private readonly emailService: EmailService,
    private readonly organizationFileService: OrganizationFileService,
    // @Inject(GitlabService)
    // private readonly gitlabService: GitlabService,
    @Inject(UserInvitationService)
    private readonly invitationService: UserInvitationService,
    @Inject(ApplicationService)
    private readonly applicationService: ApplicationService,
    @Inject(ProjectService)
    private readonly projectService: ProjectService,
    @Inject(RoutineService)
    private readonly routineService: RoutineService,
    @Inject(FeatureLicenseService)
    private readonly licenseService: FeatureLicenseService,
  ) {}

  async isOrganizationExist(organizationId: OrganizationId): Promise<boolean> {
    const rv = await this.dataSource.getRepository(Organization).findOne({
      where: { organizationId },
    });
    return rv ? true : false;
  }

  async findOrganizationByIdPublic(organizationId: OrganizationId): Promise<Organization> {
    const org = await this.dataSource.getRepository(Organization).findOne({ where: { organizationId } });

    if (!org) {
      throw new NotFoundException(`Organization not found`);
    }

    return org;
  }

  async findOrganizationByOrganizationId(organizationId: OrganizationId, userPayload: UserPayload): Promise<OrganizationResponse> {
    const organizationRoleIdPropSnake = OrganizationAndUserAndOrganizationRolePropSnake.organization_role_id;
    const organizationRoleIdPropCamel = OrganizationAndUserAndOrganizationRolePropCamel.organizationRoleId;

    const orgUserRole = await this.dataSource //
      .getRepository(OrganizationAndUserAndOrganizationRole) //
      .createQueryBuilder('orgUserRole')
      .innerJoinAndSelect(
        `orgUserRole.${OrganizationAndUserAndOrganizationRolePropCamel.organization}`,
        'organization',
        `organization.${OrganizationPropSnake.organization_id} = :${OrganizationPropCamel.organizationId}`,
        {
          organizationId,
        },
      )
      .innerJoinAndSelect(`orgUserRole.${OrganizationAndUserAndOrganizationRolePropCamel.user}`, 'user')
      .leftJoinAndSelect(`organization.${OrganizationPropCamel.organizationSlack}`, 'organizationSlack')
      .where(`orgUserRole.${organizationRoleIdPropSnake} = :${organizationRoleIdPropCamel}`, {
        [organizationRoleIdPropCamel]: ORGANIZATION_ROLE.OWNER,
      })
      .getOne();

    if (!orgUserRole) {
      throw new HttpException(`organization not found or organization does not have owner. organizationId: ${organizationId}`, HttpStatus.NOT_FOUND);
    }

    const organization = orgUserRole.organization;
    if (!organization) {
      throw new HttpException(`organization not found. organizationId: ${organizationId}`, HttpStatus.NOT_FOUND);
    }

    if (!orgUserRole.user) {
      throw new HttpException('organization does not have owner profile', HttpStatus.NOT_FOUND);
    }
    const owner = orgUserRole.user;

    const orgBase: OrganizationBase = { ...organization, owner };
    const user = await this.dataSource.getRepository(User).findOne({ where: { userId: userPayload.userId } });

    if (FEATURE_CONFIG.get('licenseModule') === 'self-hosted') {
      const licenseInfo = await this.licenseService.getLicense(organizationId);
      return { ...organization, owner, licenseInfo };
      // if (user!.isRoot) {
      //   return { ...organization, owner, licenseInfo };
      // }
      // return orgBase;
    } else {
      // if (user!.userId == owner.userId) {
      //   return { ...organization, owner };
      // }

      return orgBase;
    }
  }

  async createOrganization(manager: EntityManager, userId: UserId, dto: createOrganizationDto): Promise<OrganizationBase> {
    const orgData = manager.getRepository(Organization).create({ name: dto.name });
    const org = await manager.getRepository(Organization).save(orgData);
    const organizationId = org.organizationId;

    const user = await manager.getRepository(User).findOne({ where: { userId } });
    if (!user) {
      throw new HttpException(`user not found. userId: ${userId}`, HttpStatus.NOT_FOUND);
    }
    // mapping - organization - user - role
    const userData = manager
      .getRepository(OrganizationAndUserAndOrganizationRole) //
      .create({ organizationId, userId, organizationRoleId: ORGANIZATION_ROLE.OWNER });
    await manager.getRepository(OrganizationAndUserAndOrganizationRole).save(userData);

    // create organization key
    const organizationKey = manager.getRepository(OrganizationKey).create({
      organizationKeyId: v4(),
      organizationId,
      key: crypto.createHash('sha256').update(organizationId).digest('base64').substring(0, 32),
    });
    await manager.getRepository(OrganizationKey).save(organizationKey);

    await this.createAccessToken(manager, organizationId);

    return org;
  }

  async updateOrganization(userPayload: UserPayload, organizationId: OrganizationId, dto: UpdateOrganizationDto): Promise<OrganizationBase> {
    const organization = await this.dataSource.getRepository(Organization).findOne({
      where: { organizationId },
    });

    if (!organization) {
      throw new HttpException('organization not found', HttpStatus.NOT_FOUND);
    }

    const newData = Object.assign(organization, dto);

    const rv = await this.dataSource.transaction(async (manager) => {
      const org: OrganizationBase = await manager.getRepository(Organization).save(newData);
      return org;
    });

    return rv;
  }

  async uploadOrganizationImage(userPayload: UserPayload, organizationId: OrganizationId, file: Express.Multer.File): Promise<OrganizationBase> {
    const organization = await this.dataSource.getRepository(Organization).findOne({
      where: { organizationId },
    });

    if (!organization) {
      throw new HttpException('organization not found', HttpStatus.NOT_FOUND);
    }

    const imageUrl = await this.organizationFileService.uploadProfileImage(file, organization.organizationId);
    const newData = Object.assign(organization, { profileImageUrl: imageUrl });
    return await this.dataSource.getRepository(Organization).save(newData);
  }

  async findOrganizationWithAllRelations(manager: EntityManager, organizationId: OrganizationId, withDeleted: boolean): Promise<Organization | null> {
    const query = withDeleted //
      ? await this.dataSource.getRepository(Organization).createQueryBuilder('organization').withDeleted()
      : await this.dataSource.getRepository(Organization).createQueryBuilder('organization');

    const organization = await query
      .leftJoinAndSelect(`organization.${OrganizationPropCamel.devices}`, 'device')
      .leftJoinAndSelect(`organization.${OrganizationPropCamel.deviceTags}`, 'deviceTags')
      .leftJoinAndSelect(`organization.${OrganizationPropCamel.hosts}`, 'host')
      .leftJoinAndSelect(`organization.${OrganizationPropCamel.organizationAndUserAndTeams}`, 'orgUserTime')
      .leftJoinAndSelect(`organization.${OrganizationPropCamel.organizationAndUserAndOrganizationRoles}`, 'orgUserRole')
      .leftJoinAndSelect(`organization.${OrganizationPropCamel.teams}`, 'team')
      .leftJoinAndSelect(`organization.${OrganizationPropCamel.userVisits}`, 'userVisit')
      .leftJoinAndSelect(`organization.${OrganizationPropCamel.userInvitations}`, 'userInvitation')
      .leftJoinAndSelect(`userInvitation.${UserAndInvitationTokenPropCamel.token}`, 'invitationtoken')
      // project
      .leftJoinAndSelect(`organization.${OrganizationPropCamel.projects}`, 'project')
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
      .where(`organization.${OrganizationPropSnake.organization_id} = :${OrganizationPropCamel.organizationId}`, { organizationId })
      .getOne();

    return organization;
  }

  async softRemoveOrganization(userPayload: UserPayload, organizationId: OrganizationId): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const organization = await this.findOrganizationWithAllRelations(manager, organizationId, false);
      if (!organization) {
        throw new HttpException(`OrganizationId : ${organizationId} is not found.`, HttpStatus.NOT_FOUND);
      }

      const teams = organization.teams ? organization.teams : [];

      const projects = organization.projects ? organization.projects : [];

      for (const project of projects) {
        const { projectId } = project;
        const orgId = project.organizationId;

        const projectUserRoles = project.projectAndUserAndProjectRoles ? project.projectAndUserAndProjectRoles : [];
        for (const projectUserRole of projectUserRoles) {
          await manager.getRepository(ProjectAndUserAndProjectRole).softDelete({ userId: projectUserRole.userId, projectId: projectUserRole.projectId });
        }

        const projectTeamRoles = project.projectAndTeamAndProjectRoles ? project.projectAndTeamAndProjectRoles : [];
        for (const projectTeamRole of projectTeamRoles) {
          await manager.getRepository(ProjectAndTeamAndProjectRole).softDelete({ projectId: projectTeamRole.projectId, teamId: projectTeamRole.teamId });
        }

        await manager.getRepository(Project).softDelete({ organizationId: orgId, projectId });

        const deviceAndProjects = project.projectAndDevices ? project.projectAndDevices : [];
        for (const deviceAndProject of deviceAndProjects) {
          await manager.getRepository(ProjectAndDevice).softDelete({ projectId: deviceAndProject.projectId, deviceId: deviceAndProject.deviceId });
        }

        const routines = project.routines ? project.routines : [];
        const routineIds = routines.map((routine) => routine.routineId);
        await manager.getRepository(Routine).softDelete({ routineId: In(routineIds) });

        const pipelines = routines.map((routine) => routine.routinePipelines).flat();
        const pipelineIds = pipelines.filter(notEmpty).map((pipeline) => pipeline.routinePipelineId);
        await manager.getRepository(RoutinePipeline).softDelete({ routinePipelineId: In(pipelineIds) });

        const jobs = pipelines
          .filter(notEmpty)
          .map((pipeline) => pipeline.routineJobs)
          .flat()
          .filter(notEmpty);
        const jobIds = jobs.map((job) => job.routineJobId);
        await manager.getRepository(RoutineJob).softDelete({ routineJobId: In(jobIds) });

        const jobEdges = jobs
          .map((job) => job.routineJobEdges)
          .flat()
          .filter(notEmpty);
        await manager.getRepository(RoutineJobEdge).softRemove(jobEdges);

        const deviceJobs = jobs
          .map((job) => job.routineDeviceJobs)
          .flat()
          .filter(notEmpty);
        const deviceJobIds = deviceJobs.map((deviceJob) => deviceJob.routineDeviceJobId);
        await manager.getRepository(RoutineDeviceJob).softDelete({ routineDeviceJobId: In(deviceJobIds) });

        const steps = deviceJobs
          .map((deviceJob) => deviceJob.routineSteps)
          .flat()
          .filter(notEmpty);
        const stepIds = steps.map((step) => step.routineStepId);
        await manager.getRepository(RoutineStep).softDelete({ routineStepId: In(stepIds) });

        const dests = steps
          .map((step) => step.dests)
          .flat()
          .filter(notEmpty);
        const destIds = dests.map((dest) => dest.destId);
        await manager.getRepository(Dest).softDelete({ destId: In(destIds) });

        const destEdges = dests
          .map((dest) => dest.destEdges)
          .flat()
          .filter(notEmpty);
        await manager.getRepository(DestEdge).softRemove(destEdges);
        await manager.getRepository(Project).softDelete({ organizationId: orgId, projectId });
      }

      await manager.getRepository(Team).softDelete({ organizationId });
      await manager.getRepository(Device).softDelete({ organizationId });
      await manager.getRepository(DeviceTag).softDelete({ organizationId });
      await manager.getRepository(Host).softDelete({ organizationId });
      await manager.getRepository(UserVisit).softDelete({ organizationId });
      await manager.getRepository(UserAndInvitationToken).softDelete({ organizationId });
      await manager.getRepository(OrganizationAndUserAndTeam).softDelete({ organizationId });
      const invitations = organization.userInvitations ? organization.userInvitations : [];
      const tokenIds = invitations.map((invitation) => invitation.tokenId);
      await manager.getRepository(Token).softDelete({ tokenId: In(tokenIds) });
      await manager.getRepository(OrganizationAndUserAndOrganizationRole).softDelete({ organizationId });
      await manager.getRepository(OrganizationKey).softDelete({ organizationId });
      await manager.getRepository(Organization).softRemove(organization);
    });
  }

  async updateOwner(originOwnerId: UserId, organizationId: OrganizationId, dto: UpdateOrganizationOwnerDto): Promise<void> {
    const newOwnerId = dto.userId;
    if (originOwnerId === newOwnerId) {
      throw new HttpException(`origin owner and new owner is same.`, HttpStatus.BAD_REQUEST);
    }

    const user = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where({ userId: newOwnerId })
      .innerJoinAndSelect(
        `user.${UserPropCamel.organizationAndUserAndOrganizationRoles}`,
        'orgUserRole',
        `orgUserRole.${OrganizationAndUserAndOrganizationRolePropSnake.organization_id} = :${OrganizationAndUserAndOrganizationRolePropCamel.organizationId}`,
        { organizationId },
      )
      .getOne();

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    await this.dataSource.transaction(async (manager) => {
      const originOwner = await manager.findOne(
        OrganizationAndUserAndOrganizationRole, //
        { where: { userId: originOwnerId, organizationId } },
      );
      const newOwner = await manager.findOne(
        OrganizationAndUserAndOrganizationRole, //
        { where: { userId: newOwnerId, organizationId } },
      );

      if (!originOwner || !newOwner) {
        {
          throw new NotFoundException('User not found');
        }
      }

      await manager.save(OrganizationAndUserAndOrganizationRole, Object.assign(originOwner, { organizationRoleId: ORGANIZATION_ROLE.ADMIN }));
      await manager.save(OrganizationAndUserAndOrganizationRole, Object.assign(newOwner, { organizationRoleId: ORGANIZATION_ROLE.OWNER }));
    });
  }

  async findInvitationsByOrganizationId(organizationId: OrganizationId, dto: FindInvitationsDto): Promise<Page<UserAndInvitationTokenBase>> {
    const rv = await this.dataSource //
      .getRepository(UserAndInvitationToken)
      .createQueryBuilder('invitation')
      .where(`invitation.${UserAndInvitationTokenPropSnake.organization_id} = :${UserAndInvitationTokenPropCamel.organizationId}`, { organizationId })
      .andWhere(`invitation.${UserAndInvitationTokenPropSnake.status} = :${UserAndInvitationTokenPropCamel.status}`, { status: dto.status })
      .orderBy(`invitation.${UserAndInvitationTokenPropSnake.updated_at}`, 'ASC')
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit())
      .getManyAndCount();

    const invitations = rv[0];
    const count = rv[1];

    if (invitations.length === 0) {
      return EMPTY_PAGE;
    }

    const page = new Page(dto.page, dto.offset, count, invitations);
    return page;
  }

  async forceInviteUser(organizationId: OrganizationId, userId: UserId, dto: InviteEmailDto): Promise<void> {
    const invitedUser = await this.dataSource.getRepository(User).findOne({ where: { email: dto.email } });
    if (!invitedUser) {
      throw new HttpException(`This email is not registered.`, HttpStatus.BAD_REQUEST);
    }

    const { organizationRoleId } = dto;
    const email = dto.email.toLowerCase();

    const [invitation, invitedUserCheck, user, organization] = await Promise.all([
      this.dataSource.getRepository(UserAndInvitationToken).findOne({
        where: { email, organizationId },
        withDeleted: true,
      }),
      this.dataSource
        .getRepository(User)
        .createQueryBuilder('user')
        .innerJoinAndSelect(
          `user.${UserPropCamel.organizationAndUserAndOrganizationRoles}`,
          'orgUserRole',
          `orgUserRole.${OrganizationAndUserAndOrganizationRolePropSnake.organization_id} = :${OrganizationAndUserAndOrganizationRolePropCamel.organizationId}`,
          { organizationId },
        )
        .where(`user.${UserPropSnake.email} =:${UserPropCamel.email}`, { email })
        .getOne(),
      this.dataSource.getRepository(User).findOne({ where: { userId } }),
      this.dataSource.getRepository(Organization).findOne({ where: { organizationId } }),
    ]);

    if (invitedUserCheck) {
      throw new HttpException(`User already exists. email: ${email}`, HttpStatus.BAD_REQUEST);
    }
    if (!user) {
      throw new NotFoundException(`Inviter not found`);
    }
    if (!organization) {
      throw new HttpException(`Organization not found. OrganizationId: ${organizationId}`, HttpStatus.NOT_FOUND);
    }

    const acceptUserInvitationDto: AcceptUserInvitationDto = await this.dataSource.transaction(async (manager) => {
      const week = 1000 * 60 * 60 * 24 * 7;
      const tokenData = manager.getRepository(Token).create({
        token: TokenService.createToken(),
        expiredAt: TokenService.createExpiredAt(week),
      });
      const token = await manager.getRepository(Token).save(tokenData);

      if (invitation) {
        if (invitation.deletedAt) {
          await manager.getRepository(UserAndInvitationToken).recover(invitation);
          invitation.status = USER_INVITATION_STATUS.ACCEPTED;
        }
        await manager.getRepository(Token).softDelete({ tokenId: invitation.tokenId });
        invitation.organizationRoleId = organizationRoleId;
        invitation.tokenId = token.tokenId;
        await manager.getRepository(UserAndInvitationToken).save(invitation);
      } else {
        const invitationData = manager.getRepository(UserAndInvitationToken).create({
          email,
          organizationId,
          organizationRoleId,
          tokenId: token.tokenId,
          inviterId: userId,
          status: USER_INVITATION_STATUS.PENDING,
        });

        await manager.getRepository(UserAndInvitationToken).insert(castEntity(invitationData));
      }
      return {
        email,
        organizationId,
        token: token.token,
      };
    });
    await this.invitationService.acceptInvitation(invitedUser.userId, acceptUserInvitationDto);
  }

  async sendInviteEmail(organizationId: OrganizationId, userId: UserId, dto: InviteEmailDto): Promise<void> {
    const { organizationRoleId } = dto;
    const email = dto.email.toLowerCase();

    const [invitation, invitedUser, user, organization] = await Promise.all([
      this.dataSource.getRepository(UserAndInvitationToken).findOne({
        where: { email, organizationId },
        withDeleted: true,
      }),
      this.dataSource
        .getRepository(User)
        .createQueryBuilder('user')
        .innerJoinAndSelect(
          `user.${UserPropCamel.organizationAndUserAndOrganizationRoles}`,
          'orgUserRole',
          `orgUserRole.${OrganizationAndUserAndOrganizationRolePropSnake.organization_id} = :${OrganizationAndUserAndOrganizationRolePropCamel.organizationId}`,
          { organizationId },
        )
        .where(`user.${UserPropSnake.email} =:${UserPropCamel.email}`, { email })
        .getOne(),
      this.dataSource.getRepository(User).findOne({ where: { userId } }),
      this.dataSource.getRepository(Organization).findOne({ where: { organizationId } }),
    ]);

    if (invitedUser) {
      throw new HttpException(`User already exists. email: ${email}`, HttpStatus.BAD_REQUEST);
    }
    if (!user) {
      throw new NotFoundException(`Inviter not found`);
    }
    if (!organization) {
      throw new HttpException(`Organization not found. OrganizationId: ${organizationId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      const week = 1000 * 60 * 60 * 24 * 7;
      const tokenData = manager.getRepository(Token).create({
        token: TokenService.createToken(),
        expiredAt: TokenService.createExpiredAt(week),
      });
      const token = await manager.getRepository(Token).save(tokenData);

      if (invitation) {
        if (invitation.deletedAt) {
          await manager.getRepository(UserAndInvitationToken).recover(invitation);
          invitation.status = USER_INVITATION_STATUS.PENDING;
        }
        await manager.getRepository(Token).softDelete({ tokenId: invitation.tokenId });
        invitation.organizationRoleId = organizationRoleId;
        invitation.tokenId = token.tokenId;
        await manager.getRepository(UserAndInvitationToken).save(invitation);
      } else {
        const invitationData = manager.getRepository(UserAndInvitationToken).create({
          email,
          organizationId,
          organizationRoleId,
          tokenId: token.tokenId,
          inviterId: userId,
          status: USER_INVITATION_STATUS.PENDING,
        });

        await manager.getRepository(UserAndInvitationToken).insert(castEntity(invitationData));
      }
      this.emailService.sendInvitationEmail(organization, user, email, token.token);
    });
  }

  async softRemoveInvitation(organizationId: OrganizationId, email: string): Promise<void> {
    const invitation = await this.invitationService.findInvitationWithAllRelations(this.dataSource.manager, organizationId, email, false);
    if (!invitation) {
      throw new HttpException(`Invitation not found. email: ${email}, organizationId: ${organizationId}`, HttpStatus.NOT_FOUND);
    }
    if (!invitation.token) {
      throw new HttpException(`Token not found. email: ${email}, organizationId: ${organizationId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.getRepository(UserAndInvitationToken).softRemove(invitation);
  }

  async updateOrganizationUserRole(userId: UserId, organizationId: OrganizationId, dto: UpdateOrganizationRoleDto): Promise<void> {
    const orgUserRole = await this.dataSource.getRepository(OrganizationAndUserAndOrganizationRole).findOne({
      where: { organizationId, userId },
    });
    const { organizationRoleId } = dto;
    if (!orgUserRole) {
      throw new HttpException(`User not found. user: ${userId}, organization: ${organizationId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(OrganizationAndUserAndOrganizationRole).update({ organizationId, userId }, { organizationRoleId });
    });
  }

  private async createAccessToken(manager: EntityManager, organizationId: OrganizationId): Promise<string> {
    const orgApiToken = await manager.getRepository(OrganizationAccessToken).findOne({
      where: { organizationId },
    });

    if (orgApiToken) {
      throw new HttpException(`AccessToken already exists. organizationId: ${organizationId}`, HttpStatus.BAD_REQUEST);
    }

    const newTokenData: DeepPartial<Token> = {
      token: TokenService.createOrganizationAccessToken(),
      expiredAt: null,
    };
    const tokenData = manager.getRepository(Token).create(newTokenData);
    const token = await manager.getRepository(Token).save(tokenData);

    const newOrgApiData: DeepPartial<OrganizationAccessToken> = {
      organizationAccessTokenId: v4(),
      organizationId,
      creatorId: null,
      revokerId: null,
      tokenId: token.tokenId,
    };
    const orgApiTokenData = manager.getRepository(OrganizationAccessToken).create(newOrgApiData);
    await manager.getRepository(OrganizationAccessToken).save(orgApiTokenData);

    return token.token;
  }

  async findAccessToken(organizationId: OrganizationId): Promise<string> {
    const orgApiToken = await this.dataSource //
      .getRepository(OrganizationAccessToken)
      .createQueryBuilder('orgApiToken')
      .innerJoinAndSelect(`orgApiToken.${OrganizationAccessTokenPropCamel.token}`, 'token')
      .where(`orgApiToken.${OrganizationAccessTokenPropSnake.organization_id} = :organizationId`, { organizationId })
      .getOne();

    if (!orgApiToken) {
      throw new HttpException(`AccessToken not found. organizationId: ${organizationId}`, HttpStatus.NOT_FOUND);
    }

    return orgApiToken.token.token;
  }

  async regenerateAccessToken(organizationId: OrganizationId, creatorId: UserId): Promise<string> {
    const orgApiToken = await this.dataSource //
      .getRepository(OrganizationAccessToken)
      .createQueryBuilder('orgApiToken')
      .innerJoinAndSelect(`orgApiToken.${OrganizationAccessTokenPropCamel.token}`, 'token')
      .where(`orgApiToken.${OrganizationAccessTokenPropSnake.organization_id} = :organizationId`, { organizationId })
      .getOne();

    if (!orgApiToken) {
      throw new HttpException(`AccessToken not found. organizationId: ${organizationId}`, HttpStatus.NOT_FOUND);
    }

    const rv = await this.dataSource.transaction(async (manager) => {
      // revoke
      await manager.getRepository(Token).softDelete({ tokenId: orgApiToken.tokenId });
      await manager.getRepository(OrganizationAccessToken).update({ organizationAccessTokenId: orgApiToken.organizationAccessTokenId }, { revokerId: creatorId });
      await manager.getRepository(OrganizationAccessToken).softDelete({ organizationAccessTokenId: orgApiToken.organizationAccessTokenId });

      // reissue
      const newTokenData: DeepPartial<Token> = {
        token: TokenService.createOrganizationAccessToken(),
      };
      const tokenData = manager.getRepository(Token).create(newTokenData);
      const token = await manager.getRepository(Token).save(tokenData);

      const newOrgApiData: DeepPartial<OrganizationAccessToken> = {
        organizationAccessTokenId: v4(),
        organizationId,
        creatorId,
        tokenId: token.tokenId,
      };
      const newOrgApiTokenData = manager.getRepository(OrganizationAccessToken).create(newOrgApiData);
      const newApiToken = await manager.getRepository(OrganizationAccessToken).save(newOrgApiTokenData);

      return token.token;
    });

    return rv;
  }

  async deleteAccessToken(organizationId: OrganizationId, revokerId: UserId): Promise<void> {
    const orgApiToken = await this.dataSource //
      .getRepository(OrganizationAccessToken)
      .createQueryBuilder('orgApiToken')
      .innerJoinAndSelect(`orgApiToken.${OrganizationAccessTokenPropCamel.token}`, 'token')
      .where(`orgApiToken.${OrganizationAccessTokenPropSnake.organization_id} = :organizationId`, { organizationId })
      .getOne();

    if (!orgApiToken) {
      throw new HttpException(`AccessToken not found. organizationId: ${organizationId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Token).softDelete({ tokenId: orgApiToken.tokenId });
      await manager.getRepository(OrganizationAccessToken).update({ organizationAccessTokenId: orgApiToken.organizationAccessTokenId }, { revokerId });
      await manager.getRepository(OrganizationAccessToken).softDelete({ organizationAccessTokenId: orgApiToken.organizationAccessTokenId });
    });
  }
}
