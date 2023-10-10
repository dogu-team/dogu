import { Module } from '@nestjs/common';
import { BrowserManagerModule } from '../browser-manager/browser-manager.module';
import { DeviceHostController } from './device-host.controller';
import { DeviceHostDownloadSharedResourceService } from './device-host.download-shared-resource';
import { DeviceHostResignAppFileService } from './device-host.resign-app-file';

@Module({
  imports: [BrowserManagerModule],
  controllers: [DeviceHostController],
  providers: [DeviceHostDownloadSharedResourceService, DeviceHostResignAppFileService],
  exports: [DeviceHostDownloadSharedResourceService],
})
export class DeviceHostModule {}
