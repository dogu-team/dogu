import { OrganizationAndUserAndOrganizationRolePropCamel, UserAndInvitationTokenPropCamel, UserAndInvitationTokenPropSnake } from '@dogu-private/console';
import { OrganizationId, UserId, USER_INVITATION_STATUS } from '@dogu-private/types';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, Not } from 'typeorm';

import { OrganizationAndUserAndOrganizationRole } from '../../db/entity/index';
import { UserAndInvitationToken } from '../../db/entity/relations/user-and-invitation-token.entity';
import { CloudLicenseService } from '../../enterprise/module/license/cloud-license.service';
import { FeatureConfig } from '../../feature.config';
import { castEntity } from '../../types/entity-cast';
import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { TokenService } from '../token/token.service';
import { AcceptUserInvitationDto } from './dto/user-invitation.dto';

@Injectable()
export class UserInvitationService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly cloudLicenseService: CloudLicenseService,
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
    if (TokenService.isExpired(invitationToken.expiredAt)) {
      throw new BadRequestException('Expired invitation');
    }

    await this.dataSource.transaction(async (entityManager) => {
      // if invitee is owner, move owner to exising member and leave
      const currentOrgRole = await entityManager.findOne(OrganizationAndUserAndOrganizationRole, { where: { userId } });
      if (currentOrgRole?.organizationRoleId === ORGANIZATION_ROLE.OWNER) {
        const members = await entityManager.find(OrganizationAndUserAndOrganizationRole, { where: { organizationId: currentOrgRole.organizationId, userId: Not(userId) } });
        if (members.length > 0) {
          const adminMember = members.find((member) => member.organizationRoleId === ORGANIZATION_ROLE.ADMIN);
          const member = adminMember || members[0];

          await entityManager.update(
            OrganizationAndUserAndOrganizationRole,
            { organizationId: currentOrgRole.organizationId, userId: member.userId },
            { organizationRoleId: ORGANIZATION_ROLE.OWNER },
          );
        } else {
          if (FeatureConfig.get('licenseModule') === 'cloud') {
            const license = await this.cloudLicenseService.getLicenseInfo(organizationId);
            const hasUsingPlan = license.billingOrganization?.billingPlanInfos?.some((plan) => plan.state === 'subscribed' || plan.state === 'change-option-or-period-requested');

            if (hasUsingPlan) {
              throw new BadRequestException('Plan subscription is in progress.');
            }
          }
        }
      }

      await entityManager.softDelete(OrganizationAndUserAndOrganizationRole, { userId });
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
    });

    return;
  }
}
