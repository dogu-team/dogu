import { Module } from '@nestjs/common';
import { DeviceMessageQueue } from '../device-message/device-message.queue';
import { DeviceMessageRelayer } from '../device-message/device-message.relayer';
import { FeatureFileModule } from '../feature/file/feature-file.module';
import { ProjectFileService } from '../file/project-file.service';
import { DeviceTagService } from '../organization/device-tag/device-tag.service';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { ApplicationService } from '../project/application/application.service';
import { DeviceWebDriverService } from './device-webdriver.service';
import { WebDriverController } from './webdriver.controller';
import { WebDriverService } from './webdriver.service';

@Module({
  imports: [FeatureFileModule],
  providers: [WebDriverService, DeviceWebDriverService, DeviceTagService, DeviceStatusService, DeviceMessageRelayer, DeviceMessageQueue, ApplicationService, ProjectFileService],
  exports: [WebDriverService, DeviceWebDriverService, DeviceTagService, DeviceStatusService, DeviceMessageRelayer, DeviceMessageQueue, ApplicationService, ProjectFileService],
  controllers: [WebDriverController],
})
export class WebDriverModule {}
