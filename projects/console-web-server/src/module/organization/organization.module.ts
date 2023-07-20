import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization, OrganizationAndUserAndOrganizationRole, Token, User } from '../../db/entity';
import { OrganizatioAccessToken } from '../../db/entity/organization-access-token.entity';
import { UserAndInvitationToken } from '../../db/entity/relations/user-and-invitation-token.entity';
import { EmailModule } from '../email/email.module';
import { FileModule } from '../file/file.module';
import { GitlabModule } from '../gitlab/gitlab.module';
import { ProjectModule } from '../project/project.module';
import { RoutineModule } from '../routine/routine.module';
import { UserInvitationModule } from '../user-invitation/user-invitation.module';
import { UserModule } from '../user/user.module';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, User, OrganizationAndUserAndOrganizationRole, UserAndInvitationToken, OrganizatioAccessToken, Token]),
    forwardRef(() => UserModule),
    EmailModule,
    UserInvitationModule,
    ProjectModule,
    GitlabModule,
    FileModule,
    RoutineModule,
  ],
  exports: [OrganizationService],
  providers: [OrganizationService],
  controllers: [OrganizationController],
})
export class OrganizationModule {}
