import { Module } from '@nestjs/common';
import { ConsoleClientModule } from '../console-client/console-client.module';
import { ProcessorModule } from '../processor/processor.module';
import { DeviceJobContextRegistry } from './device-job.context-registry';
import { DeviceJobLogProcessRegistry } from './device-job.device-log-process-registry';
import { DeviceJobHeartbeater } from './device-job.heartbeater';
import { DeviceJobLogger } from './device-job.logger';
import { DeviceJobRecordingProcessRegistry } from './device-job.recording-process-registry';
import { DeviceJobUpdater } from './device-job.updater';

@Module({
  imports: [ConsoleClientModule, ProcessorModule],
  providers: [DeviceJobHeartbeater, DeviceJobUpdater, DeviceJobRecordingProcessRegistry, DeviceJobContextRegistry, DeviceJobLogProcessRegistry, DeviceJobLogger],
  exports: [DeviceJobContextRegistry, DeviceJobLogger],
})
export class DeviceJobModule {}
