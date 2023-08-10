import { Module } from '@nestjs/common';
import { DeviceHostModule } from '../device-host/device-host.module';
import { ScanModule } from '../scan/scan.module';
import { DeviceHostDownloadSharedResourceWebsocketService } from './device-host/download-shared-resource';
import { DeviceHostUploadFileService } from './device-host/upload-file.service';
import { DeviceHostWebSocketRelayWebsocketService } from './device-host/websocket-relay.service';
import { DeviceConnectionSubscribeService } from './device/connection-subscribe.service';
import { DeviceForwardService } from './device/forward.service';
import { DeviceInstallAppService } from './device/install-app.service';
import { DeviceJoinWifiService } from './device/join-wifi.service';
import { DeviceLogSubscribeService } from './device/log-subscribe.service';
import { DeviceRecordingService } from './device/recording.service';
import { DeviceResetService } from './device/reset.service';
import { DeviceRunAppService } from './device/run-app.service';
import { DeviceRuntimeInfoSubscribeService } from './device/runtime-info-subscribe.service';
import { DeviceStreamingService } from './device/streaming.service';
import { DeviceTcpRelayService } from './device/tcp-relay.service';
import { DeviceUninstallAppService } from './device/uninstall-app.service';

@Module({
  imports: [ScanModule, DeviceHostModule],
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
    DeviceJoinWifiService,
    DeviceHostUploadFileService,
    DeviceHostDownloadSharedResourceWebsocketService,
    DeviceHostWebSocketRelayWebsocketService,
    DeviceTcpRelayService,
  ],
})
export class WsModule {}
