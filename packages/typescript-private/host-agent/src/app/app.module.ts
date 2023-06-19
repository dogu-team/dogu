import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ConsoleClientModule } from '../console-client/console-client.module';
import { DeviceClientModule } from '../device-client/device-client.module';
import { DeviceJobModule } from '../device-job/device-job.module';
import { DeviceModule } from '../device/device.module';
import { HostModule } from '../host/host.module';
import { HttpWsProxyModule } from '../http-ws-proxy/http-ws-proxy.module';
import { LoggerModule } from '../logger/logger.module';
import { MessageModule } from '../message/message.module';
import { ProcessorModule } from '../processor/processor.module';
import { StatusModule } from '../status/status.module';
import { StepModule } from '../step/step.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConsoleClientModule,
    HostModule,
    DeviceClientModule,
    DeviceModule,
    MessageModule,
    StepModule,
    LoggerModule,
    HttpWsProxyModule,
    DeviceJobModule,
    ProcessorModule,
    StatusModule,
  ],
})
export class AppModule {}
