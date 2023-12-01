import { Injectable } from '@nestjs/common';
import { KnownBlock, WebClient } from '@slack/web-api';

import { env } from '../../env';
import { DoguLogger } from '../logger/logger';
import { SendPurchaseSlackMessageParam, SendPurchaseSuccessSlackMessageParam, SendUnsubscribeSlackMessageParam } from './slack.type';

@Injectable()
export class SlackService {
  private readonly billingSlackChannel = 'C065Z65USDR';

  constructor(private readonly logger: DoguLogger) {}

  async sendPurchaseSlackMessage(param: SendPurchaseSlackMessageParam): Promise<void> {
    const blocks: KnownBlock[] = [
      {
        type: 'header',
        text: { type: 'plain_text', text: param.isSucceeded ? `(${env.DOGU_BILLING_RUN_TYPE}) ✅ New purchase succeeded!` : `(${env.DOGU_BILLING_RUN_TYPE}) 🚨 Purchase failed!` },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Purchased At:* ${param.purchasedAt.toUTCString()}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Organization ID*\n${param.organizationId}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Plan Info*\n${param.plans.map((plan) => `Option: ${plan.option}, Type: ${plan.type}`).join(`\n`)}`,
        },
      },
    ];

    const successBlocks: KnownBlock[] = blocks.concat([
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Amount*\n${(param as SendPurchaseSuccessSlackMessageParam).amount.toLocaleString(
            (param as SendPurchaseSuccessSlackMessageParam).currency === 'KRW' ? 'ko-KR' : 'en-US',
          )} ${(param as SendPurchaseSuccessSlackMessageParam).currency}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *History ID*\n${(param as SendPurchaseSuccessSlackMessageParam).historyId}`,
        },
      },
    ]);

    try {
      const web = new WebClient(env.DOGU_SLACK_BOT_TOKEN);
      const result = await web.chat.postMessage({
        text: ' ',
        blocks: param.isSucceeded ? successBlocks : blocks,
        channel: this.billingSlackChannel,
      });
      if (!result.ok) {
        this.logger.error(`Failed to send purchase slack message. Result is not ok.`);
      }
    } catch (e) {
      this.logger.error(`Failed to send purchase slack message`);
    }
  }

  async sendUnsubscribeSlackMessage(param: SendUnsubscribeSlackMessageParam): Promise<void> {
    const blocks: KnownBlock[] = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `(${env.DOGU_BILLING_RUN_TYPE}) 😭 User unsubsribed plan!` },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Organization ID*\n${param.organizationId}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Plan Info*\nOption: ${param.plan.option}, Type: ${param.plan.type}`,
        },
      },
    ];

    try {
      const web = new WebClient(env.DOGU_SLACK_BOT_TOKEN);
      const result = await web.chat.postMessage({
        text: ' ',
        blocks,
        channel: this.billingSlackChannel,
      });
      if (!result.ok) {
        this.logger.error(`Failed to send unsubscribe slack message. Result is not ok.`);
      }
    } catch (e) {
      this.logger.error(`Failed to send unsubscribe slack message`);
    }
  }
}
