import { Module } from '@nestjs/common';
import { DeviceMessageModule } from '../../module/device-message/device-message.module';
import { DeviceModule } from '../../module/organization/device/device.module';
import { RemoteModule } from '../../module/remote/remote.module';
import { RemoteGamiumGateway } from './remote-gamium.gateway';
import { RemoteGamiumService } from './remote-gamium.service';

@Module({
  imports: [DeviceModule, RemoteModule, DeviceMessageModule],
  providers: [RemoteGamiumGateway, RemoteGamiumService],
})
export class RemoteGamiumModule {}
