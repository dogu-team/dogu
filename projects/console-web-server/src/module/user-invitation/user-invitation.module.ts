import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAndInvitationToken } from '../../db/entity/relations/user-and-invitation-token.entity';
import { GitlabModule } from '../gitlab/gitlab.module';
import { UserInvitationController } from './user-invitation.controller';
import { UserInvitationService } from './user-invitation.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserAndInvitationToken]), GitlabModule],
  controllers: [UserInvitationController],
  providers: [UserInvitationService],
  exports: [UserInvitationService],
})
export class UserInvitationModule {}
