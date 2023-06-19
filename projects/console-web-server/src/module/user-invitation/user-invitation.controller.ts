import { OrganizationId, UserId, UserPayload } from '@dogu-private/types';
import { Body, Controller, Get, HttpException, HttpStatus, Inject, Post, Query } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { UserAndInvitationToken } from '../../db/entity/relations/user-and-invitation-token.entity';
import { User as UserEntity } from '../../db/entity/user.entity';
import { EMAIL_VERIFICATION } from '../auth/auth.types';
import { EmailVerification, User } from '../auth/decorators';
import { AcceptUserInvitationDto } from './dto/user-invitation.dto';
import { UserInvitationService } from './user-invitation.service';

@Controller('invitations')
export class UserInvitationController {
  constructor(
    @Inject(UserInvitationService)
    private readonly invitationService: UserInvitationService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  async findInvitation(@Query('email') email: string, @Query('organizationId') organizationId: OrganizationId, @Query('token') token: string): Promise<UserAndInvitationToken> {
    const invitation = await this.invitationService.findInvitation(email, organizationId, token);

    if (!invitation) {
      throw new HttpException('Invitation does not exist', HttpStatus.NOT_FOUND);
    }

    return invitation;
  }

  @Post('accept')
  @EmailVerification(EMAIL_VERIFICATION.UNVERIFIED)
  async acceptInvitation(@User() userPayload: UserPayload, @Body() dto: AcceptUserInvitationDto): Promise<void> {
    const { email, organizationId, token } = dto;
    await this.validateUserAndEmail(userPayload.userId, email);
    await this.invitationService.acceptInvitation(userPayload.userId, dto);
  }

  private async validateUserAndEmail(userId: UserId, email: string) {
    const user = await this.dataSource.getRepository(UserEntity).findOne({ where: { userId } });

    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (user.email !== email) {
      throw new HttpException('Email not matched', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
