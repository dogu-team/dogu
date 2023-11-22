import { Module } from '@nestjs/common';
import { PaddleCaller } from './paddle.caller';
import { PaddleController } from './paddle.controller';
import { PaddleNotificationService } from './paddle.notification.service';

@Module({
  controllers: [PaddleController],
  providers: [PaddleNotificationService, PaddleCaller],
})
export class PaddleModule {}
