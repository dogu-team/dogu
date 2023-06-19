import { Module } from '@nestjs/common';
import { SlackBotController } from '../../module/slack-bot/slack-bot.controller';
import { SlackBotService } from '../../module/slack-bot/slack-bot.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [SlackBotController],
  providers: [SlackBotService],
})
export class SlackBotModule {}
