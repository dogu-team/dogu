import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineDeviceJob } from '../../db/entity/device-job.entity';
import { Device } from '../../db/entity/device.entity';
import { Host } from '../../db/entity/host.entity';
import { Organization, RoutineJobEdge } from '../../db/entity/index';
import { RoutineJob } from '../../db/entity/job.entity';
import { RoutinePipeline } from '../../db/entity/pipeline.entity';
import { RecordCaseAction } from '../../db/entity/record-case-action.entity';
import { RecordDeviceJob } from '../../db/entity/record-device-job.entity';
import { RecordPipeline } from '../../db/entity/record-pipeline.entity';
import { RecordStepAction } from '../../db/entity/record-step-action.entity';
import { RemoteDest } from '../../db/entity/remote-dest.entity';
import { RemoteDeviceJob } from '../../db/entity/remote-device-job.entity';
import { Routine } from '../../db/entity/routine.entity';
import { RoutineStep } from '../../db/entity/step.entity';
import { SlackModule } from '../../enterprise/module/integration/slack/slack.module';
import { DeviceMessageModule } from '../device-message/device-message.module';
import { ProjectModule } from '../project/project.module';
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
import { RecordCaseActionUpdater } from './record/record-case-action-updater';
import { RecordDeviceJobUpdater } from './record/record-device-job-updater';
import { RecordPipelineSystemProcessor } from './record/record-pipeline-system.processor';
import { RecordPipelineUpdater } from './record/record-pipeline-updater';
import { RecordStepActionUpdater } from './record/record-step-action-updater';
import { RemoteDeviceJobUpdater } from './remote/remote-device-job-updater';
import { RemoteSystemProcessor } from './remote/remote-system.processor';
import { UpdateConsumer } from './update-consumers';
import { UpdateProducer } from './update-producer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Host,
      Device,
      RoutineDeviceJob,
      RoutinePipeline,
      RoutineJob,
      RoutineStep,
      RoutineJobEdge,
      Routine,
      Organization,
      RemoteDeviceJob,
      RemoteDest,
      RecordPipeline,
      RecordDeviceJob,
      RecordCaseAction,
      RecordStepAction,
    ]), //
    DeviceMessageModule,
    forwardRef(() => PipelineModule),
    RemoteModule,
    SlackModule,
    ProjectModule,
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

    RecordPipelineSystemProcessor,
    RecordStepActionUpdater,
    RecordCaseActionUpdater,
    RecordDeviceJobUpdater,
    RecordPipelineUpdater,
  ],
  exports: [CancelPipelineQueue, UpdateStepStatusQueue, UpdateDeviceJobStatusQueue, UpdateDestStateQueue, UpdateRemoteDestStateQueue],
})
export class EventModule {}
