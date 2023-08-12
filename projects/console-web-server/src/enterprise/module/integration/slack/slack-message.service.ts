import { OrganizationId, Platform } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { ChatPostMessageArguments, KnownBlock, WebClient } from '@slack/web-api';

import { EntityManager } from 'typeorm';
import { Device } from '../../../../db/entity/device.entity';
import { OrganizationSlack } from '../../../../db/entity/organization-slack.entity';
import { EncryptService } from '../../../../module/encrypt/encrypt.service';

@Injectable()
export class SlackMessageService {
  static SUCCESS_COLOR = '#2eb886';
  static FAILED_COLOR = '#ff0000';

  constructor() {}

  public async sendRemoteMessage(
    manager: EntityManager,
    organizationId: OrganizationId,
    slackChannelId: string,
    message: { isSucceeded: boolean; executorName: string; remoteName: string; remoteUrl: string; durationSeconds: number },
  ) {
    const client = await this.getWebClient(manager, organizationId);

    const remoteLink = `*Remote* *<${message.remoteUrl}|${message.remoteName}>* `;
    const title = message.isSucceeded ? `${remoteLink} is succeeded` : `${remoteLink} is failed`;
    const color = message.isSucceeded ? SlackMessageService.SUCCESS_COLOR : SlackMessageService.FAILED_COLOR;

    const messageAttachment: ChatPostMessageArguments = {
      channel: slackChannelId,
      text: title,
      attachments: [
        {
          color: color,
          blocks: [
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Executor*\n${message.executorName}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Duration*\n${message.durationSeconds} seconds`,
                },
              ],
            },
          ],
        },
      ],
    };

    await client.chat.postMessage(messageAttachment);
  }

  public async sendRoutineMessage(
    manager: EntityManager,
    organizationId: OrganizationId,
    slackChannelId: string,
    message: {
      isSucceeded: boolean;
      executorName: string;
      durationSeconds: number;
      routineName: string;
      pipelineIndex: number;
      pipelineUrl: string;
      routineDevices: { routineName: string; devices: { deviecJobUrl: string; device: Device }[] }[];
    },
  ) {
    const client = await this.getWebClient(manager, organizationId);

    const pipelineLink = `*Routine* *<${message.pipelineUrl}|${message.routineName} (#${message.pipelineIndex})>* `;
    const title = message.isSucceeded ? `${pipelineLink} is succeeded` : `${pipelineLink} is failed`;
    const color = message.isSucceeded ? SlackMessageService.SUCCESS_COLOR : SlackMessageService.FAILED_COLOR;

    const messageAttachment: ChatPostMessageArguments = {
      channel: slackChannelId,
      text: title,
      attachments: [
        {
          color: color,
          blocks: [
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Executor*\n${message.executorName}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Duration*\n${message.durationSeconds} seconds`,
                },
              ],
            },
          ],
        },
      ],
    };

    if (!message.isSucceeded) {
      for (const routineDevice of message.routineDevices) {
        const blocks: KnownBlock[] = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${routineDevice.routineName}*`,
            },
          },
        ];

        for (const { deviecJobUrl, device } of routineDevice.devices) {
          let emoji = '';
          switch (device.platform) {
            case Platform.PLATFORM_LINUX:
            case Platform.PLATFORM_MACOS:
            case Platform.PLATFORM_WINDOWS:
              emoji = ':desktop_computer:';
              break;
            case Platform.PLATFORM_ANDROID:
            case Platform.PLATFORM_IOS:
              emoji = ':iphone:';
              break;
          }

          blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${emoji} <${deviecJobUrl}|${device.name} (${device.modelName})>`,
            },
          });
        }

        messageAttachment.attachments![0].blocks!.push(...blocks);
      }
    }

    await client.chat.postMessage(messageAttachment);
  }

  public async getUserId(manager: EntityManager, organizationId: OrganizationId, email: string): Promise<string | undefined> {
    const client = await this.getWebClient(manager, organizationId);

    const users = await client.users.list();
    const user = users.members?.find((user) => user.profile?.email === email);

    return user === undefined ? undefined : user.id;
  }

  private async getWebClient(manager: EntityManager, organizationId: OrganizationId): Promise<WebClient> {
    const organizationSlack = await manager.getRepository(OrganizationSlack).findOne({ where: { organizationId } });
    if (!organizationSlack) {
      throw new Error('Organization Slack is not registered');
    }

    const decryptedAccessToken = await EncryptService.decryptToken(manager, organizationId, organizationSlack.accessToken);
    const client = new WebClient(decryptedAccessToken);

    return client;
  }
}
