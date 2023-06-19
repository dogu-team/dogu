import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineDeviceJob } from '../../db/entity/device-job.entity';
import { Device } from '../../db/entity/device.entity';
import { Host } from '../../db/entity/host.entity';
import { Organization } from '../../db/entity/organization.entity';
import { RoutineStep } from '../../db/entity/step.entity';
import { DeviceMessageModule } from '../device-message/device-message.module';
import { EventModule } from '../event/event.module';
import { InfluxDbModule } from '../influxdb/influxdb.module';
import { DeviceModule } from '../organization/device/device.module';
import { PipelineModule } from '../routine/pipeline/pipeline.module';
import { PrivateDeviceJobController } from './private-device-job-controller';
import { PrivateDeviceController } from './private-device.controller';
import { PrivateHostTokenController } from './private-host-token.controller';
import { PrivateHostController } from './private-host.controller';
import { PrivateStepController } from './private-step-controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Device, Host, RoutineStep, RoutineDeviceJob]), DeviceModule, DeviceMessageModule, InfluxDbModule, PipelineModule, EventModule],
  controllers: [PrivateHostTokenController, PrivateHostController, PrivateDeviceController, PrivateDeviceJobController, PrivateStepController],
})
export class PrivateModule {}
