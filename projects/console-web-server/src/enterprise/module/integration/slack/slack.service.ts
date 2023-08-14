import { OrganizationSlackBase } from '@dogu-private/console/src/base/organization-slack';
import { OrganizationId, SlackChannelItem } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { WebClient } from '@slack/web-api';
import { DataSource } from 'typeorm';

import { OrganizationSlack } from '../../../../db/entity/organization-slack.entity';
import { EncryptService } from '../../../../module/encrypt/encrypt.service';

@Injectable()
export class SlackService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  public async connect(organizationSlack: OrganizationSlackBase) {
    await this.dataSource.transaction(async (manager) => {
      const createdOrganizationSlack = manager.getRepository(OrganizationSlack).create(organizationSlack);

      const encryptedToken = await EncryptService.encryptToken(manager, organizationSlack.organizationId, createdOrganizationSlack.accessToken);
      createdOrganizationSlack.accessToken = encryptedToken;

      await manager.getRepository(OrganizationSlack).save(createdOrganizationSlack);
    });
  }

  public async disconnect(organizationId: OrganizationId) {
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(OrganizationSlack).delete({ organizationId: organizationId });
    });
  }

  public async getChannels(organizationId: OrganizationId): Promise<SlackChannelItem[]> {
    return await this.dataSource.transaction(async (manager) => {
      const organizationSlack = await manager.getRepository(OrganizationSlack).findOne({ where: { organizationId: organizationId } });

      if (!organizationSlack) {
        return [];
      }

      const decryptedAccessToken = await EncryptService.decryptToken(manager, organizationId, organizationSlack.accessToken);
      const client = new WebClient(decryptedAccessToken);
      const { channels } = await client.conversations.list({ types: 'public_channel,private_channel' });

      if (!channels) {
        return [];
      }

      const channelItems: SlackChannelItem[] = [];

      for (const channel of channels) {
        if (!channel.is_archived) {
          const channelItem: SlackChannelItem = {
            channelId: channel.id!,
            channelName: channel.name!,
            isPrivate: channel.is_private!,
          };

          channelItems.push(channelItem);
        }
      }

      return channelItems;
    });
  }
}
