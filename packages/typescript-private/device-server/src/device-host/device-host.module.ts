import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BrowserManagerModule } from '../browser-manager/browser-manager.module';
import { DeviceHostController } from './device-host.controller';
import { DeviceHostDownloadSharedResourceService } from './device-host.download-shared-resource';
import { DeviceHostResignAppFileService } from './device-host.resign-app-file';

@Module({
  imports: [BrowserManagerModule, AuthModule],
  controllers: [DeviceHostController],
  providers: [DeviceHostDownloadSharedResourceService, DeviceHostResignAppFileService],
  exports: [DeviceHostDownloadSharedResourceService, DeviceHostResignAppFileService],
})
export class DeviceHostModule {}
