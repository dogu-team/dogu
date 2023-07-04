import {
  OrganizationAndUserAndOrganizationRolePropCamel,
  OrganizationAndUserAndOrganizationRolePropSnake,
  OrganizationBase,
  OrganizationPropCamel,
  OrganizationPropSnake,
  OrganizationUserAndTeamPropCamel,
  ProjectAndUserAndProjectRolePropCamel,
  UserAndInvitationTokenPropCamel,
  UserAndResetPasswordTokenPropCamel,
  UserAndVerificationTokenPropCamel,
  UserBase,
  UserPropCamel,
  UserPropSnake,
  UserResponse,
  UserVisitPropCamel,
  UserVisitPropSnake,
} from '@dogu-private/console';
import { UserId } from '@dogu-private/types';
import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Brackets, DataSource, In } from 'typeorm';

import { OrganizationId } from '@dogu-private/types';
import { notEmpty } from '@dogu-tech/common';
import { Organization, OrganizationAndUserAndOrganizationRole, OrganizationAndUserAndTeam, Project, ProjectAndUserAndProjectRole, Token } from '../../db/entity/index';
import { UserAndInvitationToken } from '../../db/entity/relations/user-and-invitation-token.entity';
import { UserVisit } from '../../db/entity/user-visit.entity';
import { User } from '../../db/entity/user.entity';
import { EMPTY_PAGE, Page } from '../../module/common/dto/pagination/page';
import { FindUsersByOrganizationIdDto, ResetPasswordDto, UpdateUserDto } from '../../module/user/dto/user.dto';
import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { PageDto } from '../common/dto/pagination/page.dto';
import { UserFileService } from '../file/user-file.service';
import { GitlabService } from '../gitlab/gitlab.service';

@Injectable()
export class UserService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly userFileService: UserFileService,
    @Inject(GitlabService)
    private readonly gitlabService: GitlabService,
  ) {}

  async findOne(userId: UserId): Promise<UserBase> {
    const user = await this.dataSource
      .getRepository(User) //
      .createQueryBuilder('user')
      .innerJoinAndSelect(`user.${UserPropCamel.userAndVerificationToken}`, 'userAndVerificationToken')
      .leftJoinAndSelect(`user.${UserPropCamel.userVisits}`, 'userVisit')
      .where(`user.${UserPropSnake.user_id} = :${UserPropCamel.userId}`, { userId })
      .orderBy(`userVisit.${UserVisitPropCamel.updatedAt}`, 'DESC')
      .getOne();

    if (!user) {
      throw new HttpException(`User not found : ${userId}`, HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async findOneByIdWithDetail(userId: UserId): Promise<UserBase> {
    const user = await this.dataSource
      .getRepository(User) //
      .createQueryBuilder('user')
      .innerJoinAndSelect(`user.${UserPropCamel.userAndVerificationToken}`, 'userAndVerificationToken')
      .leftJoinAndSelect(`user.${UserPropCamel.userVisits}`, 'userVisit')
      .leftJoinAndSelect(`user.${UserPropCamel.emailPreference}`, 'userEmailPreference')
      .where(`user.${UserPropSnake.user_id} = :${UserPropCamel.userId}`, { userId })
      .orderBy(`userVisit.${UserVisitPropCamel.updatedAt}`, 'DESC')
      .getOne();

    if (!user) {
      throw new HttpException(`User not found : ${userId}`, HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async findLastAccessOrganizationId(email: string): Promise<OrganizationId | null> {
    const visit = await this.dataSource //
      .getRepository(UserVisit) //
      .createQueryBuilder('visit')
      .innerJoinAndSelect(`visit.${UserVisitPropCamel.user}`, 'user')
      .where(`user.${UserPropSnake.email} = :${UserPropSnake.email}`, { email })
      .orderBy(`visit.${UserVisitPropSnake.updated_at}`, 'DESC')
      .getOne();

    return visit?.organizationId ?? null;
  }

  async findOrganizationsByUserId(userId: UserId, dto: PageDto): Promise<Page<OrganizationBase>> {
    const rv = await this.dataSource //
      .getRepository(Organization)
      .createQueryBuilder('organization')
      .innerJoinAndSelect(`organization.${OrganizationPropCamel.organizationAndUserAndOrganizationRoles}`, 'orgUserRole')
      .leftJoinAndSelect(`orgUserRole.${OrganizationAndUserAndOrganizationRolePropCamel.user}`, 'user')
      .leftJoinAndSelect(
        `organization.${OrganizationPropCamel.userVisits}`,
        'userVisit', //
        `userVisit.${UserVisitPropSnake.user_id} = :${UserVisitPropCamel.userId}`,
        { userId },
      )
      .where((qb) => {
        const subQuery = qb //
          .subQuery()
          .select(`subOrgUserRole.${OrganizationAndUserAndOrganizationRolePropSnake.organization_id}`)
          .from(OrganizationAndUserAndOrganizationRole, 'subOrgUserRole')
          .where(`subOrgUserRole.${OrganizationAndUserAndOrganizationRolePropSnake.user_id} = :${OrganizationAndUserAndOrganizationRolePropCamel.userId}`, {
            [OrganizationAndUserAndOrganizationRolePropCamel.userId]: userId,
          })
          .andWhere(`subOrgUserRole.${OrganizationAndUserAndOrganizationRolePropSnake.deleted_at} IS NULL`)
          .getQuery();

        return `organization.${OrganizationPropSnake.organization_id} IN ${subQuery}`;
      })
      .orderBy(`userVisit.${UserVisitPropCamel.updatedAt}`, 'DESC')
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit())
      .getManyAndCount();

    const organizations = rv[0];
    const count = rv[1];

    // many to many relation
    organizations.map((organization) => {
      const organizationAndUserAndOrganizationRoles = organization.organizationAndUserAndOrganizationRoles ? organization.organizationAndUserAndOrganizationRoles : [];
      organization.users = organizationAndUserAndOrganizationRoles.map((orgUserRole) => orgUserRole.user).filter(notEmpty);
    });

    if (organizations.length === 0) {
      return EMPTY_PAGE;
    }

    const orgBases = organizations.map((organization) => {
      const organizationAndUserAndOrganizationRoles = organization.organizationAndUserAndOrganizationRoles ? organization.organizationAndUserAndOrganizationRoles : [];
      if (organizationAndUserAndOrganizationRoles.length === 0) {
        throw new HttpException('organization role data error', HttpStatus.NOT_FOUND);
      }

      const ownerId = organizationAndUserAndOrganizationRoles.find((orgUserRole) => {
        return orgUserRole.organizationRoleId === ORGANIZATION_ROLE.OWNER;
      })?.userId;
      if (!ownerId) {
        throw new HttpException('organization owner data error', HttpStatus.NOT_FOUND);
      }

      const users = organizationAndUserAndOrganizationRoles
        .map((orgUserRole) => {
          return orgUserRole.user;
        })
        .filter((user): user is User => {
          return user !== undefined;
        });

      const owner = users.find((user) => {
        return user.userId === ownerId;
      });

      const orgBase: OrganizationBase = { ...organization, owner, users };
      return orgBase;
    });

    const page = new Page(dto.page, dto.offset, count, orgBases);
    return page;
  }

  async findUsersByOrganizationId(organizationId: OrganizationId, dto: FindUsersByOrganizationIdDto): Promise<Page<UserResponse>> {
    const orgIdSnake = OrganizationAndUserAndOrganizationRolePropSnake.organization_id;
    const orgIdCamel = OrganizationAndUserAndOrganizationRolePropCamel.organizationId;
    const orgRoleIdCamel = OrganizationAndUserAndOrganizationRolePropCamel.organizationRole;
    const rv = await this.dataSource
      .getRepository(User) //
      .createQueryBuilder('user')
      .leftJoinAndSelect(`user.${UserPropCamel.organizationAndUserAndOrganizationRoles}`, 'orgUserRole')
      .leftJoinAndSelect(`orgUserRole.${orgRoleIdCamel}`, `OrganizationRole`)
      // .leftJoinAndSelect(`user.${UserPropCamel.projects}`, 'project')
      .leftJoinAndSelect(`user.${UserPropCamel.projectAndUserAndProjectRoles}`, 'projectUserRole')
      .leftJoinAndSelect(`projectUserRole.${ProjectAndUserAndProjectRolePropCamel.project}`, 'project')

      // .leftJoinAndSelect(`user.${UserPropCamel.teams}`, 'team')
      .leftJoinAndSelect(`user.${UserPropCamel.organizationAndUserAndTeams}`, 'orgUserTeam')
      .leftJoinAndSelect(`orgUserTeam.${OrganizationUserAndTeamPropCamel.team}`, 'team')
      .where(`orgUserRole.${orgIdSnake} = :${orgIdCamel}`, { organizationId })
      .andWhere(
        new Brackets((qb) => {
          qb.where(`replace(user.${UserPropSnake.name}, ' ', '') LIKE :keyword`, { keyword: `%${dto.keyword}%` })
            .orWhere(`user.${UserPropSnake.name} LIKE :keyword`, { keyword: `%${dto.keyword}%` })
            .orWhere(`user.${UserPropSnake.email} LIKE :keyword`, { keyword: `%${dto.keyword}%` });
        }),
      )
      .orderBy(`user.${UserPropCamel.createdAt}`, 'ASC')
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit())
      .getManyAndCount();

    const users = rv[0];
    if (users.length === 0) {
      return EMPTY_PAGE;
    }

    // many to many relation
    users.map((user) => {
      const projectUserRoles = user.projectAndUserAndProjectRoles ? user.projectAndUserAndProjectRoles : [];
      user.projects = projectUserRoles.map((projectUserRole) => projectUserRole.project).filter(notEmpty);

      const orgUserTeams = user.organizationAndUserAndTeams ? user.organizationAndUserAndTeams : [];
      user.teams = orgUserTeams.map((orgUserTeam) => orgUserTeam.team).filter(notEmpty);
    });

    const totalCount = rv[1];
    const page = new Page<UserBase>(dto.page, dto.offset, totalCount, users);

    return page;
  }

  async updateLastAccess(userId: UserId, organizationId: OrganizationId): Promise<void> {
    const visit = await this.dataSource.getRepository(UserVisit).findOne({
      where: { organizationId, userId },
    });
    if (visit) {
      //updateAt
      await this.dataSource.getRepository(UserVisit).update({ userId, organizationId }, { updatedAt: new Date() });
      return;
    }

    //create
    const newVisit = this.dataSource.getRepository(UserVisit).create({
      userId,
      organizationId,
    });
    await this.dataSource.getRepository(UserVisit).save(newVisit);
  }

  async updateUser(userId: UserId, updateUserDto: UpdateUserDto): Promise<UserResponse> {
    const user: User | null = await this.dataSource.getRepository(User).findOne({ where: { userId: userId } });
    if (!user) {
      throw new HttpException(`User not found: ${userId}`, HttpStatus.NOT_FOUND);
    }

    const newData: User = Object.assign(user, updateUserDto);

    const rv = await this.dataSource.getRepository(User).save(newData);

    return rv;
  }

  async updateUserProfileImage(userId: UserId, file: Express.Multer.File): Promise<UserResponse> {
    const user: User | null = await this.dataSource.getRepository(User).findOne({ where: { userId: userId } });

    if (!user) {
      throw new HttpException(`User not found: ${userId}`, HttpStatus.NOT_FOUND);
    }

    const imageUrl = await this.userFileService.updateProfileImage(file, user.userId);
    const newData: User = Object.assign(user, { profileImageUrl: imageUrl });
    return await this.dataSource.getRepository(User).save(newData);
  }

  async findUserWithAllRelations(userId: UserId, withDeleted: boolean): Promise<User | null> {
    const userSelectQueryBuilder = withDeleted //
      ? this.dataSource.getRepository(User).createQueryBuilder('user').withDeleted()
      : this.dataSource.getRepository(User).createQueryBuilder('user');
    const user = await userSelectQueryBuilder
      .leftJoinAndSelect(`user.${UserPropCamel.organizationAndUserAndOrganizationRoles}`, 'orgUserRole')
      .leftJoinAndSelect(`user.${UserPropCamel.projectAndUserAndProjectRoles}`, 'projectUserRole')
      .leftJoinAndSelect(`user.${UserPropCamel.organizationAndUserAndTeams}`, 'userAndTeam')
      .leftJoinAndSelect(`user.${UserPropCamel.userAndVerificationToken}`, 'userAndVerificationToken')
      .leftJoinAndSelect(`user.${UserPropCamel.userAndInvitationToken}`, 'userAndInvitationToken')
      .leftJoinAndSelect(`user.${UserPropCamel.userAndResetPasswordToken}`, 'userResetPassword')
      .leftJoinAndSelect(`userAndVerificationToken.${UserAndVerificationTokenPropCamel.token}`, 'verificationToken')
      .leftJoinAndSelect(`userAndInvitationToken.${UserAndInvitationTokenPropCamel.token}`, 'invitationToken')
      .leftJoinAndSelect(`resetPassword.${UserAndResetPasswordTokenPropCamel.token}`, 'resetPasswordToken')
      .leftJoinAndSelect(`user.${UserPropCamel.userVisits}`, 'userVisit')
      .leftJoinAndSelect(`user.${UserPropCamel.emailPreference}`, 'emailPreference')
      .where(`user.${UserPropSnake.user_id} = :userId`, { userId })
      .getOne();

    return user;
  }

  private async checkBeforeRemoveUser(user: User): Promise<void> {
    // org onwer
    const orgUserRole = user.organizationAndUserAndOrganizationRoles?.find((orgUserRole) => orgUserRole.organizationRoleId === ORGANIZATION_ROLE.OWNER);
    if (orgUserRole) {
      throw new HttpException(`Can't remove user because user is owner of organization: ${orgUserRole.organizationId}`, HttpStatus.BAD_REQUEST);
    }
  }

  async removeUser(userId: UserId): Promise<void> {
    const user = await this.findUserWithAllRelations(userId, false);

    if (!user) {
      throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
    }
    await this.checkBeforeRemoveUser(user);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(User).softRemove(user);
    });
  }

  async resetPassword(userId: UserId, resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    const user = await this.dataSource.getRepository(User).findOne({ where: { userId: userId } });
    if (!user) {
      throw new NotFoundException();
    }

    const { currentPassword, newPassword, confirmPassword } = resetPasswordDto;

    if (!user.password) {
      throw new HttpException(`Maybe sns signed up. please check your account`, HttpStatus.BAD_REQUEST);
    }

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new UnauthorizedException('Wrong current password.');
    }

    if (newPassword !== confirmPassword) {
      throw new UnauthorizedException('Passwords are not matched');
    }

    const password = await bcrypt.hash(newPassword, 10);

    await this.dataSource.transaction(async (manager) => {
      // await this.gitlabService.resetPassword(manager, userId, newPassword);
      await manager.getRepository(User).save(Object.assign(user, { password }));
    });

    return true;
  }

  async softRemoveUserFromOrganization(organizationId: OrganizationId, userId: UserId): Promise<void> {
    const user = await this.dataSource.getRepository(User).findOne({ where: { userId: userId } });
    if (!user) {
      throw new HttpException(`User not found. user: ${userId}, organization: ${organizationId}`, HttpStatus.NOT_FOUND);
    }

    const orgUserRole = await this.dataSource.getRepository(OrganizationAndUserAndOrganizationRole).findOne({
      where: { organizationId, userId },
    });
    if (!orgUserRole) {
      throw new HttpException(`User not found. user: ${userId}, organization: ${organizationId}`, HttpStatus.NOT_FOUND);
    }
    if (orgUserRole.organizationRoleId === ORGANIZATION_ROLE.OWNER) {
      throw new HttpException(`User is owner. user: ${userId}, organization: ${organizationId}`, HttpStatus.BAD_REQUEST);
    }

    const projects = await this.dataSource.getRepository(Project).find({ where: { organizationId } });
    const projectIds = projects.map((project) => project.projectId);
    const orgUserTeams = await this.dataSource.getRepository(OrganizationAndUserAndTeam).find({ where: { organizationId, userId } });
    const invitation = await this.dataSource.getRepository(UserAndInvitationToken).findOne({ where: { organizationId, email: user.email } });
    invitation?.tokenId;

    await this.dataSource.transaction(async (entityManager) => {
      //organization and role
      await entityManager.getRepository(OrganizationAndUserAndOrganizationRole).softDelete({ organizationId, userId });

      // soft delete by projectIds
      await entityManager.getRepository(ProjectAndUserAndProjectRole).softDelete({ projectId: In(projectIds), userId });
      // user and team
      await entityManager.getRepository(OrganizationAndUserAndTeam).softDelete({ organizationId, userId });
      // visit
      await entityManager.getRepository(UserVisit).softDelete({ organizationId, userId });

      // invitation
      if (invitation) {
        await entityManager.getRepository(UserAndInvitationToken).softRemove(invitation);
        await entityManager.getRepository(Token).softDelete({ tokenId: invitation.tokenId });
      }
    });

    return;
  }
}
