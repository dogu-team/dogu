import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppiumModule } from '../appium/appium.module';
import { AuthModule } from '../auth/auth.module';
import { BootstrapModule } from '../bootstrap/bootstrap.module';
import { BrowserManagerModule } from '../browser-manager/browser-manager.module';
import { ConfigModule } from '../config/config.module';
import { DeviceHostModule } from '../device-host/device-host.module';
import { DeviceInspectorModule } from '../device-inspector/device-inspector.module';
import { DevicePortModule } from '../device-port/device-port.module';
import { DeviceWebDriverModule } from '../device-webdriver/device-webdriver.module';
import { DeviceModule } from '../device/device.module';
import { GamiumModule } from '../gamium/gamium.module';
import { HttpRequestRelayModule } from '../http-request-relay/http-request-relay.module';
import { LoggerModule } from '../logger/logger.module';
import { PlatformAbilityModule } from '../platform-ability/platform-ability.module';
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
    AuthModule,
    LoggerModule,
    DeviceHostModule,
    BootstrapModule,
    AppiumModule,
    DeviceInspectorModule,
    GamiumModule,
    DeviceWebDriverModule,
    SeleniumModule,
    HttpRequestRelayModule,
    BrowserManagerModule,
    DevicePortModule,
    PlatformAbilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
