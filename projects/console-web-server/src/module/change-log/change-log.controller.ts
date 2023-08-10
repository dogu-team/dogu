import { UserPayload } from '@dogu-private/types';
import { Controller, Get, Inject, Post } from '@nestjs/common';
import { ChangeLog } from '../../db/entity/change-log.entity';
import { EMAIL_VERIFICATION } from '../auth/auth.types';
import { EmailVerification, User } from '../auth/decorators';
import { ChangeLogService } from './change-log.service';

@Controller('/change-logs')
export class ChangeLogController {
  constructor(
    @Inject(ChangeLogService)
    private readonly changeLogService: ChangeLogService,
  ) {}

  @Get()
  @EmailVerification(EMAIL_VERIFICATION.UNVERIFIED)
  async findChangeLogs(@User() userPayload: UserPayload): Promise<ChangeLog[]> {
    return this.changeLogService.findChangeLogs(userPayload.userId);
  }

  @Post('last-seen')
  @EmailVerification(EMAIL_VERIFICATION.UNVERIFIED)
  async updateLastSeenChangeLog(@User() userPayload: UserPayload) {
    return this.changeLogService.updateLastSeenChangeLog(userPayload.userId);
  }
}
