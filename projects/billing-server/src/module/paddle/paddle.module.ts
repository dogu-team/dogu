import { forwardRef, Module } from '@nestjs/common';
import { BillingCouponModule } from '../billing-coupon/billing-coupon.module';
import { DateTimeSimulatorModule } from '../date-time-simulator/date-time-simulator.module';
import { SlackModule } from '../slack/slack.module';
import { PaddleCaller } from './paddle.caller';
import { PaddleController } from './paddle.controller';
import { PaddleMigrator } from './paddle.migrator';
import { PaddleNotificationService } from './paddle.notification.service';

@Module({
  imports: [forwardRef(() => BillingCouponModule), DateTimeSimulatorModule, SlackModule],
  controllers: [PaddleController],
  providers: [PaddleNotificationService, PaddleCaller, PaddleMigrator],
  exports: [PaddleCaller, PaddleMigrator],
})
export class PaddleModule {}
