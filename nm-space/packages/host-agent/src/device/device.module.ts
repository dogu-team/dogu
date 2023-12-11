import { Module } from '@nestjs/common';
import { ConsoleClientModule } from '../console-client/console-client.module';
import { DeviceAuthModule } from '../device-auth/device-auth.module';
import { DeviceClientModule } from '../device-client/device-client.module';
import { HostModule } from '../host/host.module';
import { StepModule } from '../step/step.module';
import { DeviceConnectionSubscriber } from './device-connection.subscriber';
import { DeviceRuntimeInfoSubscriber } from './device-runtime-info.subscriber';
import { DeviceHeartbeater } from './device.heartbeater';
import { DeviceRegistry } from './device.registry';
import { DeviceResolver } from './device.resolver';
import { DeviceUpdater } from './device.updater';

@Module({
  imports: [ConsoleClientModule, DeviceClientModule, HostModule, StepModule, DeviceAuthModule],
  providers: [DeviceHeartbeater, DeviceResolver, DeviceUpdater, DeviceConnectionSubscriber, DeviceRegistry, DeviceRuntimeInfoSubscriber],
  exports: [DeviceRegistry],
})
export class DeviceModule {}
