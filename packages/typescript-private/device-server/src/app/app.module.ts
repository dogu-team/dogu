import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppiumModule } from '../appium/appium.module';
import { BootstrapModule } from '../bootstrap/bootstrap.module';
import { ConfigModule } from '../config/config.module';
import { DeviceHostModule } from '../device-host/device-host.module';
import { DeviceInspectorModule } from '../device-inspector/device-inspector.module';
import { DeviceWebDriverModule } from '../device-webdriver/device-webdriver.module';
import { DeviceModule } from '../device/device.module';
import { GamiumModule } from '../gamium/gamium.module';
import { LoggerModule } from '../logger/logger.module';
import { ProfileModule } from '../profile/profile.module';
import { ScanModule } from '../scan/scan.module';
import { SeleniumModule } from '../selenium/selenium.module';
import { UpdateTriggerModule } from '../update-trigger/update-trigger.module';
import { WsModule } from '../ws/ws.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule,
    ProfileModule,
    ScanModule,
    UpdateTriggerModule,
    WsModule,
    DeviceModule,
    LoggerModule,
    DeviceHostModule,
    BootstrapModule,
    AppiumModule,
    DeviceInspectorModule,
    GamiumModule,
    DeviceWebDriverModule,
    SeleniumModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
