import { ConnectSlackDtoBase } from '@dogu-private/console';
import { OrganizationSlackBase } from '@dogu-private/console/src/base/organization-slack';
import { OrganizationId, SlackChannelItem } from '@dogu-private/types';
import { Body, Controller, Delete, Get, Inject, Param, Post, Query, Redirect } from '@nestjs/common';
import { WebClient } from '@slack/web-api';

import { ORGANIZATION_ROLE } from '../../../../module/auth/auth.types';
import { OrganizationPermission } from '../../../../module/auth/decorators';
import { SlackService } from './slack.service';

@Controller('organizations/:organizationId/slack')
export class SlackController {
  constructor(
    @Inject(SlackService)
    private slackService: SlackService,
  ) {}

  @Get('auth')
  @Redirect()
  async auth(@Query('code') code: string): Promise<{ url: string }> {
    const client = new WebClient();

    const response = await client.oauth.v2.access({
      client_id: process.env.DOGU_SLACK_CLIENT_ID!,
      client_secret: process.env.DOGU_SLACK_CLIENT_SECRET!,
      code: code,
    });

    const callbackUrl = `${process.env.DOGU_CONSOLE_URL}/callback/slack?authedUserId=${response.authed_user?.id}&scope=${response.scope}&accessToken=${response.access_token}&botUserId=${response.bot_user_id}&teamId=${response.team?.id}&teamName=${response.team?.name}`;

    return {
      url: callbackUrl,
    };
  }

  @Post('connect')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async connect(@Param('organizationId') organizationId: OrganizationId, @Body() dto: ConnectSlackDtoBase): Promise<string> {
    const organizationSlack: OrganizationSlackBase = {
      organizationId: organizationId,
      authedUserId: dto.authedUserId,
      scope: dto.scope,
      accessToken: dto.accessToken,
      botUserId: dto.botUserId,
      teamId: dto.teamId,
      teamName: dto.teamName,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    await this.slackService.connect(organizationSlack);

    const redirectUrl = `${process.env.DOGU_CONSOLE_URL}/dashboard/${organizationId}/settings`;
    return redirectUrl;
  }

  @Delete('disconnect')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async disconnect(@Param('organizationId') organizationId: OrganizationId) {
    await this.slackService.disconnect(organizationId);
  }

  @Get('channels')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async getChannels(@Param('organizationId') organizationId: OrganizationId): Promise<SlackChannelItem[]> {
    const channels = await this.slackService.getChannels(organizationId);
    return channels;
  }
}
