import {
  OrganizationBase,
  RegisterySignResult,
  RegisteryWithOrganizationIdResult,
  UserAndVerificationTokenPropCamel,
  UserAndVerificationTokenPropSnake,
  UserPropCamel,
} from '@dogu-private/console';
import { OAuthPayLoad, OrganizationId, SNS_TYPE, UserId, USER_INVITATION_STATUS, USER_VERIFICATION_STATUS } from '@dogu-private/types';
import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';
import { DataSource, EntityManager } from 'typeorm';

import { Organization, OrganizationAndUserAndOrganizationRole, Token, User, UserEmailPreference } from '../../db/entity/index';
import { UserAndVerificationToken } from '../../db/entity/relations/user-and-verification-token.entity';
import { UserSns } from '../../db/entity/user-sns.entity';
import { WhitelistDomain } from '../../db/entity/whitelist-domain.entity';
import { CloudLicenseService } from '../../enterprise/module/license/cloud-license.service';
import { FeatureConfig } from '../../feature.config';
import { EmailService } from '../../module/email/email.service';
import { SendVerifyEmailDto, VerifyEmailDto } from '../../module/registery/dto/registery.dto';
import { TokenService } from '../../module/token/token.service';
import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { AuthJwtService } from '../auth/service/auth-jwt.service';
import { AuthUserService } from '../auth/service/auth-user.service';
import { OrganizationService } from '../organization/organization.service';
import { UserInvitationService } from '../user-invitation/user-invitation.service';
import { CreateAdminDto, SignInDto } from '../user/dto/user.dto';
import { UserCreatedEvent } from '../user/events/create-user.event';
import { UserService } from '../user/user.service';
import { createSNSUser, createUser, createUserAndVerificationToken, createUserEmailPreference } from './common';

@Injectable()
export class RegisteryService {
  constructor(
    @Inject(OrganizationService)
    private readonly organizationService: OrganizationService,
    @Inject(EmailService)
    private readonly emailService: EmailService,
    @Inject(UserInvitationService)
    private readonly invitationService: UserInvitationService,
    @Inject(AuthUserService)
    private readonly authService: AuthUserService,
    @Inject(AuthJwtService)
    private readonly authJwtService: AuthJwtService,
    @Inject(CloudLicenseService)
    private readonly cloudLicenseService: CloudLicenseService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(UserService)
    private readonly userService: UserService,
    private eventEmitter: EventEmitter2,
  ) {}

  async signUp(createUserDto: CreateAdminDto): Promise<RegisteryWithOrganizationIdResult> {
    // create Org Owner
    const { password, name, newsletter, invitationOrganizationId, invitationToken } = createUserDto;
    const email = createUserDto.email.toLowerCase();

    const domain = email.split('@')[1];
    const whitelist = await this.dataSource.getRepository(WhitelistDomain).findOne({
      where: { domain },
    });

    if (!whitelist) {
      try {
        // check email domain is valid
        const rv = await axios.get(`http://${domain}`);
        if (rv.status !== 200 || rv.statusText !== 'OK') {
          throw new HttpException(`Unsupported email domain : ${domain}. If this error persist, please contact us.`, HttpStatus.BAD_REQUEST);
        }
      } catch (e) {
        throw new HttpException(`Unsupported email domain : ${domain}. If this error persist, please contact us.`, HttpStatus.BAD_REQUEST);
      }
    }

    const userInDB = await this.dataSource.getRepository(User).findOne({
      where: { email },
      withDeleted: true,
    });

    if (userInDB) {
      throw new HttpException(`This email is already in used : ${email}`, HttpStatus.CONFLICT);
    }

    let isFromInvitation = false;
    if (invitationOrganizationId && invitationToken) {
      const isValid = await this.checkValidInvitation(email, invitationOrganizationId, invitationToken);

      if (!isValid) {
        throw new HttpException(`Invitation is not valid`, HttpStatus.BAD_REQUEST);
      }

      isFromInvitation = true;
    }

    const tokenResponse = await this.dataSource.transaction(async (entityManager) => {
      // create user
      const user = await createUser(entityManager, email, password, name);
      await this.userService.createPersonalAccessToken(entityManager, user.userId);

      // skip tutorial if user is from invitation
      if (isFromInvitation) {
        await entityManager.getRepository(User).update({ userId: user.userId }, { isTutorialCompleted: 1 });
      }

      let organization: OrganizationBase;
      // create organization or join organization if self-hosted
      if (FeatureConfig.get('licenseModule') === 'self-hosted' && !user.isRoot) {
        const result = await entityManager.getRepository(Organization).createQueryBuilder('organization').orderBy('organization.createdAt', 'DESC').getMany();

        if (result.length === 0) {
          throw new HttpException(`Organization not found`, HttpStatus.NOT_FOUND);
        }

        const userRole = entityManager.getRepository(OrganizationAndUserAndOrganizationRole).create({
          userId: user.userId,
          organizationId: result[0].organizationId,
          organizationRoleId: ORGANIZATION_ROLE.MEMBER,
        });
        await entityManager.getRepository(OrganizationAndUserAndOrganizationRole).save(userRole);

        organization = result[0];
      } else {
        organization = await this.organizationService.createOrganization(entityManager, user.userId, { name: `${user.name}'s organization` });
      }

      if (FeatureConfig.get('licenseModule') === 'cloud') {
        await this.cloudLicenseService.createLicense({ organizationId: organization.organizationId });
      }

      // create user email preference
      await createUserEmailPreference(entityManager, user.userId, newsletter);

      if (isFromInvitation) {
        const verificationData = entityManager.getRepository(UserAndVerificationToken).create({
          userId: user.userId,
          status: USER_VERIFICATION_STATUS.VERIFIED,
          tokenId: null,
        });
        await entityManager.getRepository(UserAndVerificationToken).save(verificationData);
      } else {
        // email verification token
        const expiredAt = DateTime.now().plus({ days: 7 }).toJSDate();
        const tokenString = TokenService.createToken();
        const tokenData = entityManager.getRepository(Token).create({
          expiredAt,
          token: tokenString,
        });
        const token = await entityManager.getRepository(Token).save(tokenData);

        const verificationData = entityManager.getRepository(UserAndVerificationToken).create({
          userId: user.userId,
          tokenId: token.tokenId,
          status: USER_VERIFICATION_STATUS.PENDING,
        });
        await entityManager.getRepository(UserAndVerificationToken).save(verificationData);

        void this.emailService.sendVerifyEmail(user, token.token);
      }

      this.eventEmitter.emit(UserCreatedEvent.EVENT_NAME, new UserCreatedEvent(user));

      // create token
      const accessToken = this.authJwtService.makeUserAccessToken(user.userId);
      const refreshToken = await this.authService.createRefreshToken(entityManager, user.userId);

      const rv: RegisteryWithOrganizationIdResult = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        userId: user.userId,
        organizationId: organization.organizationId,
      };

      return rv;
    });

    return tokenResponse;
  }

  async signIn(signInDto: SignInDto): Promise<RegisterySignResult> {
    const { email, password } = signInDto;

    const user = await this.dataSource.getRepository(User).findOne({ where: { email } });
    if (user) {
      if (!user.password) {
        throw new HttpException(`Maybe social signed up. please check your account`, HttpStatus.BAD_REQUEST);
      }

      if (!(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Invalid information');
      }

      const accessToken = this.authJwtService.makeUserAccessToken(user.userId);

      const refreshToken = await this.dataSource.transaction(async (manager): Promise<string> => {
        const rv = await this.authService.createRefreshToken(manager, user.userId);
        return rv;
      });

      await this.authService.clearExpiredUserRefreshToken(user.userId);

      const rv: RegisterySignResult = {
        accessToken,
        refreshToken,
        userId: user.userId,
      };

      return rv;
    }

    throw new NotFoundException();
  }
  private isSupportThirdPartySignin(snsType: SNS_TYPE): boolean {
    if (snsType === SNS_TYPE.GOOGLE) {
      return true;
    } else {
      return false;
    }
  }

  private async linkWithThirdParty(manager: EntityManager, user: User, oauthPayload: OAuthPayLoad): Promise<void> {
    const { email, userSnsId, snsType, name } = oauthPayload;
    const { userId } = user;
    await manager.getRepository(UserAndVerificationToken).update({ userId }, { status: USER_VERIFICATION_STATUS.VERIFIED });
    await createSNSUser(manager, userId, userSnsId, snsType);
  }

  async signUpWithThirdParty(oauthPayload: OAuthPayLoad): Promise<RegisteryWithOrganizationIdResult> {
    const { email, userSnsId, snsType, name } = oauthPayload;
    const user = await this.dataSource.getRepository(User).findOne({ where: { email }, withDeleted: true, relations: [UserPropCamel.userAndVerificationToken] });

    if (user) {
      if (user.deletedAt !== null) {
        throw new HttpException(`Cannot sign in with this email : ${email}`, HttpStatus.CONFLICT);
      }

      if (false === this.isSupportThirdPartySignin(snsType)) {
        throw new HttpException(`This email is already in used : ${email}`, HttpStatus.CONFLICT);
      }

      const tokenResponse = await this.dataSource.transaction(async (manager) => {
        await this.linkWithThirdParty(manager, user, oauthPayload);

        const accessToken = this.authJwtService.makeUserAccessToken(user.userId);
        const refreshToken = await this.authService.createRefreshToken(manager, user.userId);
        const rv: RegisteryWithOrganizationIdResult = {
          accessToken: accessToken,
          refreshToken: refreshToken,
          userId: user.userId,
          organizationId: '',
        };
        return rv;
      });
      return tokenResponse;
    }

    const password = null;
    const userName = name ?? email.split('@')[0];
    const tokenResponse = await this.dataSource.transaction(async (manager) => {
      const user = await createUser(manager, email, password, userName);
      await this.userService.createPersonalAccessToken(manager, user.userId);
      const snsUser = await createSNSUser(manager, user.userId, userSnsId, snsType);

      // create organization
      const organization = await this.organizationService.createOrganization(manager, user.userId, { name: `${user.name}'s organization` });

      await createUserEmailPreference(manager, user.userId, true);
      await createUserAndVerificationToken(manager, user.userId, null, USER_VERIFICATION_STATUS.VERIFIED);

      this.eventEmitter.emit(UserCreatedEvent.EVENT_NAME, new UserCreatedEvent(user));

      const accessToken = this.authJwtService.makeUserAccessToken(user.userId);
      const refreshToken = await this.authService.createRefreshToken(manager, user.userId);

      if (FeatureConfig.get('licenseModule') === 'cloud') {
        await this.cloudLicenseService.createLicense({ organizationId: organization.organizationId });
      }

      const rv: RegisteryWithOrganizationIdResult = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        userId: user.userId,
        organizationId: organization.organizationId,
      };

      return rv;
    });
    return tokenResponse;
  }

  async signInWithThirdParty(oauthPayload: OAuthPayLoad): Promise<RegisterySignResult> {
    const { email, userSnsId, snsType, name } = oauthPayload;

    const user = await this.dataSource.getRepository(User).findOne({ where: { email } });
    if (!user) {
      throw new HttpException(`User not found. Email: ${email}`, HttpStatus.NOT_FOUND);
    }

    const accessToken = this.authJwtService.makeUserAccessToken(user.userId);
    const refreshToken = await this.authService.createRefreshToken(this.dataSource.manager, user.userId);

    await this.authService.clearExpiredUserRefreshToken(user.userId);

    const rv: RegisterySignResult = {
      accessToken,
      refreshToken,
      userId: user.userId,
    };

    return rv;
  }

  async accessWithThirdParty(oauthPayload: OAuthPayLoad): Promise<RegisterySignResult | RegisteryWithOrganizationIdResult> {
    const { email, userSnsId, snsType, name } = oauthPayload;

    const snsUser = await this.dataSource.getRepository(UserSns).findOne({ where: { userSnsId } });
    if (!snsUser) {
      const rv = await this.signUpWithThirdParty(oauthPayload);
      return rv;
    } else {
      const rv = await this.signInWithThirdParty(oauthPayload);
      return rv;
    }
  }

  async vefiryEmail(dto: VerifyEmailDto): Promise<boolean> {
    const { email, token } = dto;

    const user = await this.dataSource.getRepository(User).findOne({
      where: { email },
      relations: [`${UserPropCamel.userAndVerificationToken}`],
    });
    if (!user) {
      throw new HttpException(`User not found. Email: ${email}`, HttpStatus.NOT_FOUND);
    }
    if (!user.userAndVerificationToken) {
      throw new HttpException('This User has no verification. Email: ${email}', HttpStatus.NOT_FOUND);
    }
    if (user.userAndVerificationToken.status === USER_VERIFICATION_STATUS.VERIFIED) {
      throw new HttpException(`User already verified. Email: ${email}`, HttpStatus.CONFLICT);
    }

    const rv = await this.dataSource.transaction(async (entitiyManager) => {
      const verification = await entitiyManager //
        .getRepository(UserAndVerificationToken)
        .createQueryBuilder('verification')
        .leftJoinAndSelect(`verification.${UserAndVerificationTokenPropCamel.token}`, `token`)
        .where(`verification.${UserAndVerificationTokenPropSnake.user_id} = :${UserAndVerificationTokenPropCamel.userId}`, {
          [UserAndVerificationTokenPropCamel.userId]: user.userId,
        })
        .getOne();

      if (!verification) {
        throw new HttpException('This User has no verification. Email: ${email}', HttpStatus.NOT_FOUND);
      }

      const storedToken = verification.token;
      if (!storedToken) {
        throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
      }
      if (storedToken.token !== token) {
        throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
      }
      if (TokenService.isExpired(storedToken.expiredAt)) {
        throw new HttpException('Token is expired', HttpStatus.BAD_REQUEST);
      }

      await entitiyManager.getRepository(UserAndVerificationToken).update({ userId: user.userId }, { status: USER_VERIFICATION_STATUS.VERIFIED });
      return true;
    });
    return rv;
  }

  async sendVerifyEmail(dto: SendVerifyEmailDto): Promise<void> {
    const { email } = dto;
    const user = await this.dataSource.getRepository(User).findOne({
      where: { email },
      relations: [`${UserPropCamel.userAndVerificationToken}`],
    });
    if (!user) {
      throw new HttpException(`User not found. Email: ${email}`, HttpStatus.NOT_FOUND);
    }

    if (user.userAndVerificationToken && user.userAndVerificationToken.status === USER_VERIFICATION_STATUS.VERIFIED) {
      throw new HttpException(`User already verified. Email: ${email}`, HttpStatus.CONFLICT);
    }

    await this.dataSource.transaction(async (entityManager) => {
      const hour = 1000 * 60 * 60;
      const token: Token = await entityManager.getRepository(Token).save({
        expiredAt: TokenService.createExpiredAt(hour),
        token: TokenService.createToken(),
      });

      const verification = await entityManager.getRepository(UserAndVerificationToken).findOne({ where: { userId: user.userId } });

      if (verification) {
        if (verification.tokenId) {
          await entityManager.getRepository(Token).softDelete({ tokenId: verification.tokenId });
        }

        await entityManager.getRepository(UserAndVerificationToken).update({ userId: user.userId }, { tokenId: token.tokenId });
      } else {
        const verificationData = entityManager.getRepository(UserAndVerificationToken).create({
          userId: user.userId,
          status: USER_VERIFICATION_STATUS.PENDING,
          tokenId: token.tokenId,
        });
        await entityManager.getRepository(UserAndVerificationToken).save(verificationData);
      }

      void this.emailService.sendVerifyEmail(user, token.token);
    });
  }

  async subscribeEmail(dto: { userId: UserId; token: string }): Promise<void> {
    const { userId, token } = dto;
    const userEmailPreference = await this.dataSource.getRepository(UserEmailPreference).findOne({
      where: { userId, token },
    });

    if (!userEmailPreference) {
      throw new HttpException(`User not found. userId: ${userId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.getRepository(UserEmailPreference).update({ userId, token }, { newsletter: 1 });
  }

  async unsubscribeEmail(dto: { userId: UserId; token: string }): Promise<void> {
    const { userId, token } = dto;
    const userEmailPreference = await this.dataSource.getRepository(UserEmailPreference).findOne({
      where: { userId, token },
    });

    if (!userEmailPreference) {
      throw new HttpException(`User not found. userId: ${userId}`, HttpStatus.NOT_FOUND);
    }

    await this.dataSource.getRepository(UserEmailPreference).update({ userId, token }, { newsletter: 0 });
  }

  private async checkValidInvitation(email: string, organizationId: OrganizationId, token: string): Promise<boolean> {
    const invitation = await this.invitationService.findInvitation(email, organizationId, token);

    if (!invitation) {
      throw new BadRequestException(`Invitation not found. Email: ${email}`);
    }

    if (invitation.status === USER_INVITATION_STATUS.ACCEPTED) {
      throw new BadRequestException(`Already accepted. Email: ${email}`);
    }

    return true;
  }
}
