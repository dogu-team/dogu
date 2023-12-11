import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConsoleClientModule } from '../console-client/console-client.module';
import { DeviceClientModule } from '../device-client/device-client.module';
import { DeviceModule } from '../device/device.module';
import { HostModule } from '../host/host.module';
import { HttpWsProxyModule } from '../http-ws-proxy/http-ws-proxy.module';
import { ProcessorModule } from '../processor/processor.module';
import { MessageEventController } from './message.event-controller';
import { MessagePuller } from './message.puller';
import { MessageRequestResponseController } from './message.request-response-controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({}),
    }),
    ConsoleClientModule,
    HostModule,
    DeviceClientModule,
    DeviceModule,
    HttpWsProxyModule,
    ProcessorModule,
  ],
  controllers: [MessageEventController, MessageRequestResponseController],
  providers: [MessagePuller],
})
export class MessageModule {}
