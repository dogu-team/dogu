import { Module } from '@nestjs/common';
import { ConsoleClientModule } from '../console-client/console-client.module';
import { DeviceAuthModule } from '../device-auth/device-auth.module';
import { DeviceClientModule } from '../device-client/device-client.module';
import { DeviceModule } from '../device/device.module';
import { HttpProxyProcessor } from './http-proxy.processor';
import { WebSocketProxyEventPusher } from './web-socket-proxy.event-pusher';
import { WebSocketProxyProcessRegistry } from './web-socket-proxy.process-registry';

@Module({
  imports: [ConsoleClientModule, DeviceClientModule, DeviceModule, DeviceAuthModule],
  providers: [HttpProxyProcessor, WebSocketProxyEventPusher, WebSocketProxyProcessRegistry],
  exports: [HttpProxyProcessor, WebSocketProxyProcessRegistry],
})
export class HttpWsProxyModule {}
