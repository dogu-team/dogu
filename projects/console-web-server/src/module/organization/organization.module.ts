import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Organization, OrganizationAndUserAndOrganizationRole, Token, User } from '../../db/entity';
import { OrganizationAccessToken } from '../../db/entity/organization-access-token.entity';
import { UserAndInvitationToken } from '../../db/entity/relations/user-and-invitation-token.entity';
import { LicenseModule } from '../../enterprise/module/license/license.module';
import { EmailModule } from '../email/email.module';
import { FileModule } from '../file/file.module';
import { GitlabModule } from '../gitlab/gitlab.module';
import { ProjectModule } from '../project/project.module';
import { RoutineModule } from '../routine/routine.module';
import { UserInvitationModule } from '../user-invitation/user-invitation.module';
import { UserModule } from '../user/user.module';
import { OrganizationApplicationController } from './application/application.controller';
import { OrganizationApplicationService } from './application/application.service';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, User, OrganizationAndUserAndOrganizationRole, UserAndInvitationToken, OrganizationAccessToken, Token]),
    forwardRef(() => UserModule),
    EmailModule,
    UserInvitationModule,
    ProjectModule,
    GitlabModule,
    FileModule,
    RoutineModule,
    LicenseModule,
  ],
  exports: [OrganizationService, OrganizationApplicationService],
  providers: [OrganizationService, OrganizationApplicationService],
  controllers: [OrganizationController, OrganizationApplicationController],
})
export class OrganizationModule {}
