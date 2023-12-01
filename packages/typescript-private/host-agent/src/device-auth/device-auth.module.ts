import { Module } from '@nestjs/common';
import { DeviceClientModule } from '../device-client/device-client.module';
import { DeviceAuthService } from './device-auth.service';

@Module({
  imports: [DeviceClientModule],
  providers: [DeviceAuthService],
  exports: [DeviceAuthService],
})
export class DeviceAuthModule {}
