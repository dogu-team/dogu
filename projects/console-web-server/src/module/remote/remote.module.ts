import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteWebDriverInfo } from '../../db/entity/remote-webdriver-info.entity';
import { Remote } from '../../db/entity/remote.entity';
import { DeviceMessageModule } from '../device-message/device-message.module';
import { FeatureFileModule } from '../feature/file/feature-file.module';
import { DeviceTagModule } from '../organization/device-tag/device-tag.module';
import { DeviceModule } from '../organization/device/device.module';
import { ProjectModule } from '../project/project.module';
import { RemoteDestController } from './remote-dest/remote-dest.controller';
import { RemoteDestService } from './remote-dest/remote-dest.service';
import { RemoteWebDriverInfoController } from './remote-webdriver/remote-webdriver.controller';
import { RemoteWebDriverService } from './remote-webdriver/remote-webdriver.service';
import { RemoteController } from './remote.controller';
import { RemoteService } from './remote.service';

@Module({
  imports: [FeatureFileModule, TypeOrmModule.forFeature([Remote, RemoteWebDriverInfo]), DeviceMessageModule, ProjectModule, DeviceModule, DeviceTagModule],
  providers: [RemoteService, RemoteWebDriverService, RemoteDestService],
  exports: [RemoteService, RemoteWebDriverService, RemoteDestService],
  controllers: [RemoteWebDriverInfoController, RemoteController, RemoteDestController],
})
export class RemoteModule {}
