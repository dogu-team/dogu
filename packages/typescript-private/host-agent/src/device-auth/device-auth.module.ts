import { Module } from '@nestjs/common';
import { DeviceAuthService } from './device-auth.service';

@Module({
  imports: [],
  providers: [DeviceAuthService],
  exports: [DeviceAuthService],
})
export class DeviceAuthModule {}
