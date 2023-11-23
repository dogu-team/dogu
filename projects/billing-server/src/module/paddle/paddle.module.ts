import { Module } from '@nestjs/common';
import { PaddleCaller } from './paddle.caller';
import { PaddleController } from './paddle.controller';
import { PaddleMigrationProcessor } from './paddle.migration.processor';
import { PaddleNotificationService } from './paddle.notification.service';
import { PaddleService } from './paddle.service';

@Module({
  controllers: [PaddleController],
  providers: [PaddleNotificationService, PaddleCaller, PaddleMigrationProcessor, PaddleService],
  exports: [PaddleCaller, PaddleService],
})
export class PaddleModule {}
