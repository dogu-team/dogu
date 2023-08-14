import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineDeviceJob } from '../../db/entity/device-job.entity';
import { Device } from '../../db/entity/device.entity';
import { Host } from '../../db/entity/host.entity';
import { Organization, RoutineJobEdge } from '../../db/entity/index';
import { RoutineJob } from '../../db/entity/job.entity';
import { RoutinePipeline } from '../../db/entity/pipeline.entity';
import { RemoteDest } from '../../db/entity/remote-dest.entity';
import { RemoteDeviceJob } from '../../db/entity/remote-device-job.entity';
import { Routine } from '../../db/entity/routine.entity';
import { RoutineStep } from '../../db/entity/step.entity';
import { SlackModule } from '../../enterprise/module/integration/slack/slack.module';
import { DeviceMessageModule } from '../device-message/device-message.module';
import { RemoteModule } from '../remote/remote.module';
import { PipelineModule } from '../routine/pipeline/pipeline.module';
import { DeviceConnectionUpdater } from './heartbeat/device-connection-updater';
import { HeartBeatSystemProcessor } from './heartbeat/heartbeat-system.processor';
import { HostConnectionUpdater } from './heartbeat/host-connection-updater';
import { DestUpdater } from './pipeline/dest-updater';
import { DeviceJobUpdater } from './pipeline/device-job-updater';
import { ExternalEventUpdater } from './pipeline/external-event-updater';
import { JobUpdater } from './pipeline/job-updator';
import { PipelineSystemProcessor } from './pipeline/pipeline-system.processor';
import { PipelineUpdater } from './pipeline/pipeline-updater';
import { StepUpdater } from './pipeline/step-updater';
import { CancelPipelineQueue, UpdateDestStateQueue, UpdateDeviceJobStatusQueue, UpdateRemoteDestStateQueue, UpdateStepStatusQueue } from './pipeline/update-pipeline-queue';
import { RemoteDeviceJobUpdater } from './remote/remote-device-job-updater';
import { RemoteSystemProcessor } from './remote/remote-system.processor';
import { UpdateConsumer } from './update-consumers';
import { UpdateProducer } from './update-producer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Host, Device, RoutineDeviceJob, RoutinePipeline, RoutineJob, RoutineStep, RoutineJobEdge, Routine, Organization, RemoteDeviceJob, RemoteDest]), //
    DeviceMessageModule,
    forwardRef(() => PipelineModule),
    RemoteModule,
    SlackModule,
  ],
  providers: [
    UpdateProducer,
    UpdateConsumer,

    CancelPipelineQueue,
    UpdateStepStatusQueue,
    UpdateDeviceJobStatusQueue,
    UpdateDestStateQueue,
    UpdateRemoteDestStateQueue,

    PipelineSystemProcessor,
    HeartBeatSystemProcessor,
    RemoteSystemProcessor,

    PipelineUpdater,
    JobUpdater,
    DeviceJobUpdater,
    StepUpdater,
    DestUpdater,
    ExternalEventUpdater,

    DeviceConnectionUpdater,
    HostConnectionUpdater,
    RemoteDeviceJobUpdater,
  ],
  exports: [CancelPipelineQueue, UpdateStepStatusQueue, UpdateDeviceJobStatusQueue, UpdateDestStateQueue, UpdateRemoteDestStateQueue],
})
export class EventModule {}
