import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Host } from '../../../db/entity/host.entity';
import { DeviceMessageModule } from '../../../module/device-message/device-message.module';
import { HostModule } from '../../../module/organization/host/host.module';
import { HostAppController } from './host-app.controller';
import { HostAppService } from './host-app.service';

@Module({
  imports: [TypeOrmModule.forFeature([Host]), DeviceMessageModule, HostModule],
  controllers: [HostAppController],
  providers: [HostAppService],
  exports: [HostAppService],
})
export class HostAppModule {}
