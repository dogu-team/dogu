import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from '../../../db/entity/device.entity';
import { Host } from '../../../db/entity/host.entity';
import { Organization } from '../../../db/entity/organization.entity';
import { Routine } from '../../../db/entity/routine.entity';
import { RedisModule } from '../../../module/redis/redis.module';
import { HostAppModule } from '../host-app/host-app.module';
import { HostAppUpdateProcessor } from './host-app/host-app-update-processor';

@Module({
  imports: [TypeOrmModule.forFeature([Host, Device, Routine, Organization]), RedisModule, HostAppModule],
  providers: [HostAppUpdateProcessor],
  exports: [],
})
export class EnterpriseEventModule {}
