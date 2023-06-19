import { Injectable } from '@nestjs/common';
import { Block, KnownBlock, WebClient } from '@slack/web-api';

@Injectable()
export class SlackBotService {
  async sendSlackBotMessage(channelId: string, blocks: (Block | KnownBlock)[]): Promise<boolean> {
    const web = new WebClient(process.env.DOGU_SLACK_BOT_TOKEN);
    try {
      const result = await web.chat.postMessage({
        text: ' ',
        blocks,
        channel: channelId,
      });

      if (result.ok) {
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }
}
