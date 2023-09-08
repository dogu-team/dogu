import { Module } from '@nestjs/common';
import { BrowserManagerModule } from '../browser-manager/browser-manager.module';
import { DeviceHostController } from './device-host.controller';
import { DeviceHostDownloadSharedResourceService } from './device-host.download-shared-resource';

@Module({
  imports: [BrowserManagerModule],
  controllers: [DeviceHostController],
  providers: [DeviceHostDownloadSharedResourceService],
  exports: [DeviceHostDownloadSharedResourceService],
})
export class DeviceHostModule {}
