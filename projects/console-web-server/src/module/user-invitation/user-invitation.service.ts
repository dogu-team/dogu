import { OrganizationAndUserAndOrganizationRolePropCamel, UserAndInvitationTokenPropCamel, UserAndInvitationTokenPropSnake } from '@dogu-private/console';
import { OrganizationId, UserId, USER_INVITATION_STATUS } from '@dogu-private/types';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

import { OrganizationAndUserAndOrganizationRole } from '../../db/entity/index';
import { UserAndInvitationToken } from '../../db/entity/relations/user-and-invitation-token.entity';
import { castEntity } from '../../types/entity-cast';
import { GitlabService } from '../gitlab/gitlab.service';
import { TokenService } from '../token/token.service';
import { AcceptUserInvitationDto } from './dto/user-invitation.dto';

@Injectable()
export class UserInvitationService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(GitlabService)
    private readonly gitlabService: GitlabService,
  ) {}

  async findInvitationWithAllRelations(manager: EntityManager, organizationId: OrganizationId, email: string, withDeleted: boolean): Promise<UserAndInvitationToken | null> {
    const invitationSelectQueryBuilder = withDeleted //
      ? manager.getRepository(UserAndInvitationToken).createQueryBuilder('invitation').withDeleted()
      : manager.getRepository(UserAndInvitationToken).createQueryBuilder('invitation');

    const invitation = await invitationSelectQueryBuilder //
      .leftJoinAndSelect(`invitation.${UserAndInvitationTokenPropCamel.token}`, UserAndInvitationTokenPropCamel.token)
      .where(`invitation.${UserAndInvitationTokenPropSnake.email} = :email`, { email })
      .andWhere(`invitation.${UserAndInvitationTokenPropSnake.organization_id} = :organizationId`, { organizationId })
      .getOne();

    return invitation;
  }

  async findInvitation(email: string, organizationId: string, token: string) {
    const repository = this.dataSource.getRepository(UserAndInvitationToken);
    const invitation = await repository.findOne({
      where: { email, organizationId },
      relations: [UserAndInvitationTokenPropCamel.token, UserAndInvitationTokenPropCamel.organization],
    });

    if (!invitation || invitation.token.token !== token) {
      return null;
    }

    return invitation;
  }

  async acceptInvitation(userId: UserId, dto: AcceptUserInvitationDto) {
    const { email, organizationId, token } = dto;
    const invitation = await this.findInvitation(email, organizationId, token);
    if (!invitation) {
      throw new NotFoundException('Invitation does not exist');
    }
    if (invitation.status === USER_INVITATION_STATUS.ACCEPTED) {
      throw new BadRequestException('Invitation already accepted');
    }

    const invitationToken = invitation.token;
    if (!invitationToken) {
      throw new BadRequestException('Invitation token does not exist');
    }
    if (TokenService.isExpired(invitationToken)) {
      throw new BadRequestException('Expired invitation');
    }

    await this.dataSource.transaction(async (entityManager) => {
      await entityManager.save(UserAndInvitationToken, Object.assign(invitation, { status: USER_INVITATION_STATUS.ACCEPTED }));

      // create organization - user - role relation
      const createdRelationData = entityManager //
        .getRepository(OrganizationAndUserAndOrganizationRole)
        .create({
          organizationId,
          userId,
          organizationRoleId: invitation.organizationRoleId,
          deletedAt: null,
        });

      await entityManager
        .getRepository(OrganizationAndUserAndOrganizationRole)
        .upsert(castEntity(createdRelationData), [OrganizationAndUserAndOrganizationRolePropCamel.organizationId, OrganizationAndUserAndOrganizationRolePropCamel.userId]);

      await this.gitlabService.addUserToGroup(entityManager, userId, organizationId, invitation.organizationRoleId);
    });

    return;
  }
}
