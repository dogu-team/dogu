import { ChangeLogBasePropCamel } from '@dogu-private/console';
import { ChangeLogId, UserPayload } from '@dogu-private/types';
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ChangeLog } from '../../db/entity/change-log.entity';
import { EMAIL_VERIFICATION } from '../auth/auth.types';
import { EmailVerification, User } from '../auth/decorators';
import { ChangeLogService } from './change-log.service';
import { UpdateReactionToChangeLogDto } from './dto/change-log.dto';

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
  async updateLastSeenChangeLog(@User() userPayload: UserPayload): Promise<void> {
    return this.changeLogService.updateLastSeenChangeLog(userPayload.userId);
  }

  @Patch('/:changeLogId/reaction')
  @EmailVerification(EMAIL_VERIFICATION.UNVERIFIED)
  async updateReactionToChangeLog(
    @User() userPayload: UserPayload,
    @Param(ChangeLogBasePropCamel.changeLogId) changeLogId: ChangeLogId,
    @Body() updateReactionToChangeLogDto: UpdateReactionToChangeLogDto,
  ): Promise<void> {
    return this.changeLogService.updateReactionToChangeLog(userPayload.userId, changeLogId, updateReactionToChangeLogDto);
  }

  @Delete('/:changeLogId/reaction')
  @EmailVerification(EMAIL_VERIFICATION.UNVERIFIED)
  async deleteReactionToChangeLog(@User() userPayload: UserPayload, @Param(ChangeLogBasePropCamel.changeLogId) changeLogId: ChangeLogId): Promise<void> {
    return this.changeLogService.deleteReactionToChangeLog(userPayload.userId, changeLogId);
  }
}
