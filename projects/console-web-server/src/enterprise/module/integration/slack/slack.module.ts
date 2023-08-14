import { Module } from '@nestjs/common';
import { SlackMessageService } from './slack-message.service';
import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';

@Module({
  imports: [],
  controllers: [SlackController],
  providers: [SlackService, SlackMessageService],
  exports: [SlackService, SlackMessageService],
})
export class SlackModule {}
