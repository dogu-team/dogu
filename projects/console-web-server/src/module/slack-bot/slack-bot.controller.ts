import { UserPayload } from '@dogu-private/types';
import { Body, Controller, Post } from '@nestjs/common';
import { KnownBlock } from '@slack/web-api';
import { DateTime } from 'luxon';

import { ContactDto } from '../../module/slack-bot/dto/slack-bot.dto';
import { SlackBotService } from '../../module/slack-bot/slack-bot.service';
import { EMAIL_VERIFICATION } from '../auth/auth.types';
import { EmailVerification, User } from '../auth/decorators';
import { UserService } from '../user/user.service';

@Controller('')
export class SlackBotController {
  constructor(private readonly slackBotService: SlackBotService, private readonly userService: UserService) {}

  @Post('/contact')
  async contact(@Body() contactDto: ContactDto): Promise<boolean> {
    const blocks: KnownBlock[] = [
      { type: 'header', text: { type: 'plain_text', text: 'New customer contact' } },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Date:* ${DateTime.now().setZone('Asia/Seoul').toFormat('yyyy-MM-dd HH:mm:ss')}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Name*\n${contactDto.firstName} ${contactDto.lastName}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Email*\n<mailto:${contactDto.email}|${contactDto.email}>`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *OrganizationId*\n${contactDto.organization}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Message*\n${contactDto.message}`,
        },
      },
    ];
    return await this.slackBotService.sendSlackBotMessage('C043B6AT4UX', blocks);
  }

  @Post('/feedback')
  @EmailVerification(EMAIL_VERIFICATION.UNVERIFIED)
  async feedback(@User() userPayload: UserPayload, @Body() feedbackDto: { feedback: string }): Promise<void> {
    const user = await this.userService.findOne(userPayload.userId);

    const blocks: KnownBlock[] = [
      { type: 'header', text: { type: 'plain_text', text: 'New user feedback' } },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Date:* ${DateTime.now().setZone('Asia/Seoul').toFormat('yyyy-MM-dd HH:mm:ss')}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *User Id*\n${user.userId}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *User Email*\n${user.email}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Feedback*\n${feedbackDto.feedback}`,
        },
      },
    ];

    await this.slackBotService.sendSlackBotMessage('C055LDBUJJF', blocks);
    return;
  }
}
