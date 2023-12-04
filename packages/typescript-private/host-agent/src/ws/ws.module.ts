import { Module } from '@nestjs/common';
import { DeviceAuthModule } from '../device-auth/device-auth.module';
import { DeviceAuthSubscribeService } from './device-auth-subscribe.service';

@Module({
  imports: [DeviceAuthModule],
  providers: [DeviceAuthSubscribeService],
})
export class WsModule {}
