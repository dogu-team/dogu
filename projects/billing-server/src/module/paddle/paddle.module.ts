import { Module } from '@nestjs/common';
import { PaddleCaller } from './paddle.caller';
import { PaddleController } from './paddle.controller';
import { PaddleMigrator } from './paddle.migrator';
import { PaddleNotificationService } from './paddle.notification.service';

@Module({
  controllers: [PaddleController],
  providers: [PaddleNotificationService, PaddleCaller, PaddleMigrator],
  exports: [PaddleCaller, PaddleMigrator],
})
export class PaddleModule {}
