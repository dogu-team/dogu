import { Module } from '@nestjs/common';
import { DeviceMessageQueue } from '../device-message/device-message.queue';
import { DeviceMessageRelayer } from '../device-message/device-message.relayer';
import { DeviceTagService } from '../organization/device-tag/device-tag.service';
import { DeviceStatusService } from '../organization/device/device-status.service';
import { DeviceWebDriverService } from './device-webdriver.service';
import { WebDriverController } from './webdriver.controller';
import { WebDriverService } from './webdriver.service';

@Module({
  imports: [],
  providers: [WebDriverService, DeviceWebDriverService, DeviceTagService, DeviceStatusService, DeviceMessageRelayer, DeviceMessageQueue],
  exports: [WebDriverService, DeviceWebDriverService, DeviceTagService, DeviceStatusService, DeviceMessageRelayer, DeviceMessageQueue],
  controllers: [WebDriverController],
})
export class WebDriverModule {}
