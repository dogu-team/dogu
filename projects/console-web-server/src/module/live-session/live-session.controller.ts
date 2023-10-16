import { LiveSessionCreateRequestBodyDto } from '@dogu-private/console';
import { LiveSessionId } from '@dogu-private/types';
import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { LiveSession } from '../../db/entity/live-session.entity';
import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { OrganizationPermission } from '../auth/decorators';
import { LiveSessionService } from './live-session.service';

@Controller('/live-sessions')
export class LiveSessionController {
  constructor(private readonly liveSessionService: LiveSessionService) {}

  @Post()
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async create(@Body() body: LiveSessionCreateRequestBodyDto): Promise<LiveSession> {
    return await this.liveSessionService.create(body);
  }

  @Delete('/:liveSessionId/:organizationId')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async close(@Param('liveSessionId') liveSessionId: LiveSessionId): Promise<LiveSession> {
    return await this.liveSessionService.closeByLiveSessionId(liveSessionId);
  }
}
