import { UserPropCamel, UserPropSnake } from '@dogu-private/console';
import { UserPayload, USER_VERIFICATION_STATUS } from '@dogu-private/types';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { User } from '../../../db/entity/index';
import { FEATURE_CONFIG } from '../../../feature.config';
import { DoguLogger } from '../../logger/logger';
import { EMAIL_VERIFICATION, EMAIL_VERIFICATION_KEY } from '../auth.types';
import { printLog } from './common';

@Injectable()
export class EmailVerificationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, //
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const roleType: EMAIL_VERIFICATION = this.reflector.get<EMAIL_VERIFICATION>(EMAIL_VERIFICATION_KEY, ctx.getHandler());
    if (!roleType) {
      throw new HttpException(`EmailVerificationGuard. The role is not defined.`, HttpStatus.UNAUTHORIZED);
    }
    if (config.gaurd.role.logging) {
      printLog(ctx, 'EmailVerificationGuard', roleType);
    }

    const userId = ctx.switchToHttp().getRequest<{ user: UserPayload }>().user.userId;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (!FEATURE_CONFIG.get('emailVerification')) {
      return true;
    }

    const user = await this.dataSource //
      .getRepository(User)
      .createQueryBuilder('user')
      .innerJoinAndSelect(`user.${UserPropCamel.userAndVerificationToken}`, `userAndVerificationToken`)
      .where(`user.${UserPropSnake.user_id} = :${UserPropCamel.userId}`, { userId })
      .getOne();

    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const verification = user.userAndVerificationToken;
    if (!verification) {
      throw new HttpException(`User ${userId} has no verification`, HttpStatus.BAD_REQUEST);
    }

    switch (roleType) {
      case EMAIL_VERIFICATION.VERIFIED: {
        if (verification.status === USER_VERIFICATION_STATUS.VERIFIED) {
          return true;
        } else {
          this.logger.info(`EmailVerificationGuard: User ${userId} is not verified`);
          return false;
        }
      }
      case EMAIL_VERIFICATION.UNVERIFIED:
        return true;
      default: {
        const _exhaustiveCheck: never = roleType;
        throw new HttpException(`Unknown role type ${_exhaustiveCheck}`, HttpStatus.BAD_REQUEST);
      }
    }
  }
}
