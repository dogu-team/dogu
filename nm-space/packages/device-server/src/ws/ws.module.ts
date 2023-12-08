import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BrowserManagerModule } from '../browser-manager/browser-manager.module';
import { DeviceHostModule } from '../device-host/device-host.module';
import { ScanModule } from '../scan/scan.module';
import { DeviceHostDownloadSharedResourceWebSocketService } from './device-host/download-shared-resource';
import { DeviceHostUploadFileService } from './device-host/upload-file.service';
import { DeviceAlertSubscribeService } from './device/alert-subscribe.service';
import { DeviceConnectionSubscribeService } from './device/connection-subscribe.service';
import { DeviceFindWindowsService } from './device/find-windows.service';
import { DeviceForwardService } from './device/forward.service';
import { DeviceInstallAppService } from './device/install-app.service';
import { DeviceLogSubscribeService } from './device/log-subscribe.service';
import { DeviceRecordingService } from './device/recording.service';
import { DeviceResetService } from './device/reset.service';
import { DeviceRunAppService } from './device/run-app.service';
import { DeviceRunAppiumServerService } from './device/run-appium-server.service';
import { DeviceRuntimeInfoSubscribeService } from './device/runtime-info-subscribe.service';
import { DeviceStreamingService } from './device/streaming.service';
import { DeviceTcpRelayService } from './device/tcp-relay.service';
import { DeviceUninstallAppService } from './device/uninstall-app.service';
import { DeviceWebSocketRelayService } from './device/websocket-relay.service';

@Module({
  imports: [ScanModule, DeviceHostModule, BrowserManagerModule, AuthModule],
  providers: [
    DeviceInstallAppService,
    DeviceConnectionSubscribeService,
    DeviceRuntimeInfoSubscribeService,
    DeviceLogSubscribeService,
    DeviceRunAppService,
    DeviceStreamingService,
    DeviceForwardService,
    DeviceUninstallAppService,
    DeviceRecordingService,
    DeviceResetService,
    DeviceWebSocketRelayService,
    DeviceTcpRelayService,
    DeviceRunAppiumServerService,
    DeviceHostUploadFileService,
    DeviceHostDownloadSharedResourceWebSocketService,
    DeviceFindWindowsService,
    DeviceAlertSubscribeService,
  ],
})
export class WsModule {}
