import { forwardRef, Module } from '@nestjs/common';
import { BillingCouponModule } from '../billing-coupon/billing-coupon.module';
import { PaddleCaller } from './paddle.caller';
import { PaddleController } from './paddle.controller';
import { PaddleMigrator } from './paddle.migrator';
import { PaddleNotificationService } from './paddle.notification.service';

@Module({
  imports: [forwardRef(() => BillingCouponModule)],
  controllers: [PaddleController],
  providers: [PaddleNotificationService, PaddleCaller, PaddleMigrator],
  exports: [PaddleCaller, PaddleMigrator],
})
export class PaddleModule {}
