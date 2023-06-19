import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization, OrganizationAndUserAndOrganizationRole } from '../../db/entity/index';
import { OrganizationRole } from '../../db/entity/organization-role.entity';
import { UserEmailPreference } from '../../db/entity/user-email-preference.entity';
import { UserVisit } from '../../db/entity/user-visit.entity';
import { User } from '../../db/entity/user.entity';
import { EmailModule } from '../../module/email/email.module';
import { UserController } from '../../module/user/user.controller';
import { UserService } from '../../module/user/user.service';
import { FileModule } from '../file/file.module';
import { GitlabModule } from '../gitlab/gitlab.module';
import { OrganizationModule } from '../organization/organization.module';
import { UserEventListner } from './listeners/user.listner';
import { UserEmailPreferenceService } from './user-email-preference.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserEmailPreference, OrganizationAndUserAndOrganizationRole, OrganizationRole, Organization, UserVisit]),
    EmailModule,
    GitlabModule,
    FileModule,
    forwardRef(() => OrganizationModule),
  ],
  providers: [UserService, UserEventListner, UserEmailPreferenceService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
