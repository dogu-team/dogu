import { Module } from '@nestjs/common';
import { ConsoleClientModule } from '../console-client/console-client.module';
import { DeviceClientModule } from '../device-client/device-client.module';
import { HostConnector } from './host.connector';
import { HostHeartbeater } from './host.heartbeater';
import { HostResolver } from './host.resolver';

@Module({
  imports: [ConsoleClientModule, DeviceClientModule],
  providers: [HostConnector, HostHeartbeater, HostResolver],
})
export class HostModule {}
