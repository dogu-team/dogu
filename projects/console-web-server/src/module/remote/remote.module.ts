import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteWebDriverInfo } from '../../db/entity/remote-webdriver-info.entity';
import { Remote } from '../../db/entity/remote.entity';
import { DeviceMessageQueue } from '../device-message/device-message.queue';
import { DeviceMessageRelayer } from '../device-message/device-message.relayer';
import { FeatureFileModule } from '../feature/file/feature-file.module';
import { ProjectFileService } from '../file/project-file.service';
import { DeviceTagService } from '../organization/device-tag/device-tag.service';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { ApplicationService } from '../project/application/application.service';
import { RemoteWebDriverInfoController } from './remote-webdriver/remote-webdriver.controller';
import { RemoteWebDriverService } from './remote-webdriver/remote-webdriver.service';
import { RemoteController } from './remote.controller';
import { RemoteService } from './remote.service';

@Module({
  imports: [FeatureFileModule, TypeOrmModule.forFeature([Remote, RemoteWebDriverInfo])],
  providers: [RemoteService, RemoteWebDriverService, DeviceTagService, DeviceStatusService, DeviceMessageRelayer, DeviceMessageQueue, ApplicationService, ProjectFileService],
  exports: [RemoteService, RemoteWebDriverService, DeviceTagService, DeviceStatusService, DeviceMessageRelayer, DeviceMessageQueue, ApplicationService, ProjectFileService],
  controllers: [RemoteWebDriverInfoController, RemoteController],
})
export class RemoteModule {}
