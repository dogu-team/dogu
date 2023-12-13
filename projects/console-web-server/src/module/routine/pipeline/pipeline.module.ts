import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineDeviceJob } from '../../../db/entity/device-job.entity';
import { Dest, Device, DeviceAndDeviceTag, DeviceTag, Project, ProjectAndDevice, RoutineJob, RoutineJobEdge, RoutinePipeline } from '../../../db/entity/index';
import { Routine } from '../../../db/entity/routine.entity';
import { RoutineStep } from '../../../db/entity/step.entity';
import { SlackModule } from '../../../enterprise/module/integration/slack/slack.module';
import { DeviceMessageModule } from '../../device-message/device-message.module';
import { EventModule } from '../../event/event.module';
import { FileModule } from '../../file/file.module';
import { InfluxDbModule } from '../../influxdb/influxdb.module';
import { InitModule } from '../../init/init.module';
import { DeviceTagService } from '../../organization/device-tag/device-tag.service';
import { DeviceModule } from '../../organization/device/device.module';
import { DestController } from './dest/dest.controller';
import { DestService } from './dest/dest.service';
import { DeviceJobController } from './device-job/device-job.controller';
import { DeviceJobService } from './device-job/device-job.service';
import { RoutineDeviceJobSubscriber } from './device-job/routine-device-job.subscriber';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';
import { DeviceJobMessenger } from './processor/device-job-messenger';
import { DestRunner } from './processor/runner/dest-runner';
import { DeviceJobRunner } from './processor/runner/device-job-runner';
import { JobRunner } from './processor/runner/job-runner';
import { PipelineRunner } from './processor/runner/pipeline-runner';
import { StepRunner } from './processor/runner/step-runner';
import { StepController } from './step/step.controller';
import { StepService } from './step/step.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Routine,
      RoutinePipeline,
      RoutineJob,
      RoutineDeviceJob,
      Device,
      RoutineStep,
      ProjectAndDevice,
      DeviceAndDeviceTag,
      DeviceTag,
      Project,
      RoutineJobEdge,
      RoutineDeviceJob,
      Dest,
    ]),
    InitModule,
    DeviceMessageModule,
    InfluxDbModule,
    FileModule,
    SlackModule,
    DeviceModule,
    forwardRef(() => EventModule),
  ],
  providers: [
    PipelineService, //
    DeviceJobService,
    PipelineRunner,
    JobRunner,
    DeviceJobRunner,
    StepRunner,
    DestRunner,
    DeviceJobMessenger,
    DestService,
    DeviceJobService,
    StepService,
    DeviceTagService,
    RoutineDeviceJobSubscriber,
  ],
  controllers: [PipelineController, DeviceJobController, StepController, DestController],
  exports: [
    PipelineService, //
    DeviceJobService,
    PipelineRunner,
    JobRunner,
    DeviceJobRunner,
    StepRunner,
    DestRunner,
    DeviceJobMessenger,
    DestService,
    StepService,
    DeviceTagService,
    RoutineDeviceJobSubscriber,
  ],
})
export class PipelineModule {}
