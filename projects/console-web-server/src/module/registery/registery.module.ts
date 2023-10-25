import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization, OrganizationAndUserAndOrganizationRole, SubscribeUser, User, UserAndRefreshToken } from '../../db/entity';
import { OrganizationRole } from '../../db/entity/organization-role.entity';
import { UserAndResetPasswordToken } from '../../db/entity/relations/user-and-reset-password-token.entity';
import { UserAndVerificationToken } from '../../db/entity/relations/user-and-verification-token.entity';
import { UserSns } from '../../db/entity/user-sns.entity';
import { LicenseModule } from '../../enterprise/module/license/license.module';
import { EmailModule } from '../../module/email/email.module';
import { UserModule } from '../../module/user/user.module';
import { GitlabModule } from '../gitlab/gitlab.module';
import { OrganizationModule } from '../organization/organization.module';
import { UserInvitationModule } from '../user-invitation/user-invitation.module';
import { RegisteryController } from './registery.controller';
import { RegisteryService } from './registery.service';
import { ResetPasswordService } from './reset-password.service';

const PROVIDERS = [RegisteryService, ResetPasswordService];
const CONTROLLERS = [RegisteryController];
const IMPORT_MODULES = [
  TypeOrmModule.forFeature([
    Organization,
    SubscribeUser,
    OrganizationRole,
    OrganizationAndUserAndOrganizationRole,
    UserAndVerificationToken,
    UserAndResetPasswordToken,
    UserAndRefreshToken,
    UserSns,
    User,
  ]), //
  OrganizationModule,
  EmailModule,
  UserModule,
  HttpModule,
  UserInvitationModule,
  GitlabModule,
  LicenseModule,
];

@Module({
  imports: IMPORT_MODULES,
  exports: [],
  controllers: CONTROLLERS,
  providers: PROVIDERS,
})
export class RegisteryModule {}
