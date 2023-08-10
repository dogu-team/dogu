import { UserPayload } from '@dogu-private/types';
import { Controller, Get, Inject } from '@nestjs/common';
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
  async findChangeLogs(@User() userPayload: UserPayload) {
    return this.changeLogService.findChangeLogs(userPayload.userId);
  }
}
