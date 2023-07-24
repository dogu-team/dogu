import { Module } from '@nestjs/common';
import { DeviceHostController } from './device-host.controller';
import { DeviceHostDownloadSharedResourceService } from './device-host.download-shared-resource';

@Module({
  controllers: [DeviceHostController],
  providers: [DeviceHostDownloadSharedResourceService],
  exports: [DeviceHostDownloadSharedResourceService],
})
export class DeviceHostModule {}
