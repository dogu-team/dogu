import { Module } from '@nestjs/common';
import { DeviceHostDownloadSharedResourceService } from '../device-host/device-host.download-shared-resource';
import { ScanModule } from '../scan/scan.module';
import { DeviceHostDownloadSharedResourceWebsocketService } from './device-host/download-shared-resource';
import { DeviceHostUploadFileService } from './device-host/upload-file.service';
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
import { DeviceUninstallAppService } from './device/uninstall-app.service';

@Module({
  imports: [ScanModule],
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
    DeviceHostDownloadSharedResourceService,
  ],
})
export class WsModule {}
